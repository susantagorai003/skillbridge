"""
Messaging Service for SkillBridge.
Handles Multi-Channel Notifications:
1. In-App Notifications (stored in MongoDB 'notifications' collection)
2. Email Notifications (dispatched via Django's send_mail / SMTP / console)
3. WhatsApp Notifications (dispatched via Twilio/Meta API or logged into 'whatsapp_dispatch_logs' collection)
"""
import os
import logging
import uuid
import json
import base64
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone
from django.core.mail import send_mail
from django.conf import settings
from database.connection import get_collection
from services.notification_service import NotificationService
from services.audit_service import AuditService

logger = logging.getLogger(__name__)


def _http_post(url, data=None, json_payload=None, headers=None, auth=None, timeout=10):
    """Zero-dependency HTTP POST helper using Python's standard library urllib."""
    headers = headers or {}
    if auth:
        user, pwd = auth
        creds = base64.b64encode(f"{user}:{pwd}".encode('utf-8')).decode('ascii')
        headers['Authorization'] = f"Basic {creds}"

    encoded_data = None
    if json_payload is not None:
        headers['Content-Type'] = 'application/json'
        encoded_data = json.dumps(json_payload).encode('utf-8')
    elif data is not None:
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        encoded_data = urllib.parse.urlencode(data).encode('utf-8')

    req = urllib.request.Request(url, data=encoded_data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 500, str(e)


class MessagingService:
    @staticmethod
    def send_email_notification(to_email, subject, message, html_message=None):
        """
        Dispatch an email to a recipient.
        Uses live SMTP if credentials provided, or console backend if in local dev.
        """
        if not to_email:
            return {'success': False, 'error': 'No recipient email provided'}

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@skillbridge.com')
        # Ensure subject and message are console-safe for Windows local environments
        clean_subject = str(subject).replace('₹', 'INR ')
        clean_message = str(message).replace('₹', 'INR ')
        try:
            send_mail(
                subject=clean_subject,
                message=clean_message,
                from_email=from_email,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=False
            )
            backend_name = getattr(settings, 'EMAIL_BACKEND', 'console')
            logger.info(f"[Email Dispatched via {backend_name}] To: {to_email} | Subject: {subject}")
            return {'success': True, 'email': to_email, 'backend': backend_name}
        except Exception as e:
            logger.warning(f"[Email Warning] Could not send email to {to_email}: {e}")
            return {'success': False, 'email': to_email, 'error': str(e)}

    @staticmethod
    def send_whatsapp_notification(phone, message, metadata=None):
        """
        Dispatch a WhatsApp message to a student/user's phone number.
        Supported providers:
        1. Twilio WhatsApp API (via Twilio SDK or direct REST HTTP)
        2. Meta WhatsApp Cloud API (Graph API)
        3. SkillBridge Internal SMS/WhatsApp Gateway (logged to MongoDB 'whatsapp_dispatch_logs')
        """
        if not phone:
            return {'success': False, 'error': 'No phone number provided'}

        clean_phone = phone.strip().replace(' ', '').replace('-', '')
        if not clean_phone.startswith('+') and len(clean_phone) == 10:
            clean_phone = f"+91{clean_phone}"

        dispatch_record = {
            'id': f"wa-{uuid.uuid4().hex[:12]}",
            'phone': clean_phone,
            'message': message,
            'metadata': metadata or {},
            'status': 'dispatched',
            'channel': 'whatsapp',
            'created_at': datetime.now(timezone.utc).isoformat()
        }

        # 1. Check for Twilio Credentials
        twilio_sid = os.getenv('TWILIO_ACCOUNT_SID')
        twilio_token = os.getenv('TWILIO_AUTH_TOKEN')
        twilio_wa_number = os.getenv('TWILIO_WHATSAPP_NUMBER')

        # 2. Check for Meta WhatsApp Cloud API Credentials
        meta_token = os.getenv('META_WHATSAPP_TOKEN')
        meta_phone_id = os.getenv('META_WHATSAPP_PHONE_ID')

        provider_used = 'skillbridge_sms_gateway'
        error_msg = None

        twilio_content_sid = os.getenv('TWILIO_CONTENT_SID')

        if twilio_sid and twilio_token and twilio_wa_number:
            from_wa = twilio_wa_number.strip().replace('whatsapp:', '')
            
            # 1. Attempt sending customized Body message (works seamlessly when 24h conversation session is active)
            tw_data = {
                'From': f"whatsapp:{from_wa}",
                'To': f"whatsapp:{clean_phone}",
                'Body': message
            }

            status_code, body = _http_post(
                f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json",
                auth=(twilio_sid, twilio_token),
                data=tw_data,
                timeout=12
            )

            # 2. If Twilio requires a pre-approved template (error 21654 when outside 24h user-initiated window), fallback to ContentSid
            if status_code not in (200, 201) and twilio_content_sid and ('21654' in body or 'ContentSid Required' in body):
                logger.info(f"[Twilio WhatsApp] Freeform window closed, retrying with ContentSid template {twilio_content_sid}...")
                vars_dict = (metadata or {}).get('content_variables') or {
                    "1": str((metadata or {}).get('company', 'Campus Placement')),
                    "2": str((metadata or {}).get('package', 'SkillBridge Portal'))
                }
                tw_data_template = {
                    'From': f"whatsapp:{from_wa}",
                    'To': f"whatsapp:{clean_phone}",
                    'ContentSid': twilio_content_sid,
                    'ContentVariables': json.dumps(vars_dict)
                }
                status_code, body = _http_post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json",
                    auth=(twilio_sid, twilio_token),
                    data=tw_data_template,
                    timeout=12
                )

            try:
                tw_json = json.loads(body)
            except Exception:
                tw_json = {}

            if status_code in (200, 201):
                provider_used = 'twilio'
                dispatch_record['twilio_sid'] = tw_json.get('sid')
                dispatch_record['twilio_status'] = tw_json.get('status', 'queued')
                logger.info(f"[Twilio WhatsApp SUCCESS] Delivered to {clean_phone} | SID: {tw_json.get('sid')}")
            else:
                provider_used = 'twilio_error'
                err_text = tw_json.get('message') or body
                err_code = tw_json.get('code', status_code)
                error_msg = f"Twilio Error {err_code}: {err_text}"
                logger.warning(f"[Twilio Warning] {error_msg}")

        elif meta_token and meta_phone_id:
            # Direct Meta WhatsApp Cloud API request
            payload = {
                'messaging_product': 'whatsapp',
                'to': clean_phone.replace('+', ''),
                'type': 'text',
                'text': {'body': message}
            }
            status_code, body = _http_post(
                f"https://graph.facebook.com/v18.0/{meta_phone_id}/messages",
                headers={'Authorization': f"Bearer {meta_token}"},
                json_payload=payload,
                timeout=10
            )
            if status_code in (200, 201):
                provider_used = 'meta_cloud'
                logger.info(f"[Meta WhatsApp] Delivered to {clean_phone}")
            else:
                provider_used = 'meta_error'
                error_msg = f"Meta API status {status_code}: {body}"
                logger.warning(f"[Meta Warning] {error_msg}")

        dispatch_record['provider'] = provider_used
        if error_msg:
            dispatch_record['error'] = error_msg
            dispatch_record['status'] = 'failed'

        try:
            col = get_collection('whatsapp_dispatch_logs')
            col.insert_one(dispatch_record)
            dispatch_record.pop('_id', None)
        except Exception as e:
            logger.error(f"[DB Error] Could not save WhatsApp log: {e}")

        return {
            'success': dispatch_record['status'] == 'dispatched',
            'phone': clean_phone,
            'provider': provider_used,
            'error': error_msg
        }

    @staticmethod
    def send_sms_notification(phone, message):
        """
        Dispatch a direct cellular SMS using Twilio Programmable SMS API.
        """
        if not phone:
            return {'success': False, 'error': 'No phone number provided'}

        clean_phone = phone.strip().replace(' ', '').replace('-', '')
        if not clean_phone.startswith('+') and len(clean_phone) == 10:
            clean_phone = f"+91{clean_phone}"

        twilio_sid = os.getenv('TWILIO_ACCOUNT_SID')
        twilio_token = os.getenv('TWILIO_AUTH_TOKEN')
        twilio_sms_number = os.getenv('TWILIO_PHONE_NUMBER') or os.getenv('TWILIO_SMS_NUMBER')

        if not (twilio_sid and twilio_token and twilio_sms_number):
            return {'success': False, 'provider': 'unconfigured', 'message': 'Twilio SMS credentials not set.'}

        status_code, body = _http_post(
            f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json",
            auth=(twilio_sid, twilio_token),
            data={
                'From': twilio_sms_number,
                'To': clean_phone,
                'Body': message
            },
            timeout=12
        )
        return {'success': status_code in (200, 201), 'status_code': status_code, 'body': body}

    @classmethod
    def test_delivery(cls, target_email=None, target_phone=None):
        """
        Diagnostic delivery test utility.
        Dispatches test notification to target email and target WhatsApp number.
        """
        results = {'email': None, 'whatsapp': None}

        if target_email:
            subject = "🧪 [SkillBridge Test] Email Notification Delivery Test"
            message = (
                "Hello from SkillBridge!\n\n"
                "This is a confirmation that your email notification service is properly configured and delivering messages successfully in production.\n\n"
                "SkillBridge Core Services"
            )
            html = """
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #00BFA6; border-radius: 8px;">
                <h2 style="color: #14213D; margin-top: 0;">SkillBridge Email Delivery Test</h2>
                <p style="color: #059669; font-weight: bold;">✓ Live SMTP Connection Active</p>
                <p style="color: #475569; font-size: 13px;">This verifies that your placement notifications will reach students immediately upon drive announcements.</p>
            </div>
            """
            results['email'] = cls.send_email_notification(target_email, subject, message, html_message=html)

        if target_phone:
            wa_text = (
                "🧪 *[SkillBridge Test]*\n"
                "Your WhatsApp alert service is active and connected!\n"
                "You will receive instant campus placement drive notifications and interview schedules."
            )
            results['whatsapp'] = cls.send_whatsapp_notification(target_phone, wa_text, metadata={'test': True})

        return results

    @classmethod
    def broadcast_placement_drive(cls, drive_doc):
        """
        Dispatches multi-channel alerts (In-App, Email, WhatsApp) for a newly announced Placement Drive.
        """
        company_name = drive_doc.get('company_name', 'Company')
        role_title = drive_doc.get('role_title', 'Software Engineer')
        ctc = drive_doc.get('ctc_lpa', 0)
        min_cgpa = drive_doc.get('min_cgpa', 0)
        branches = ", ".join(drive_doc.get('eligible_branches', ['All Branches']))
        deadline = drive_doc.get('deadline', 'TBD')
        drive_date = drive_doc.get('drive_date', 'TBD')
        frontend_base = os.getenv('FRONTEND_URL', 'https://skillbridge-gold-one.vercel.app').rstrip('/')

        subject = f"🎯 [SkillBridge Placement Alert] {company_name} is hiring for {role_title} (₹{ctc} LPA)"
        plain_email = (
            f"Dear Student,\n\n"
            f"A new on-campus placement drive has been announced by the Training and Placement Office (TPO):\n\n"
            f"• Company: {company_name}\n"
            f"• Job Role: {role_title}\n"
            f"• Package (CTC): ₹{ctc} LPA\n"
            f"• Minimum CGPA Cutoff: {min_cgpa}\n"
            f"• Eligible Departments: {branches}\n"
            f"• Drive Date: {drive_date}\n"
            f"• Application Deadline: {deadline}\n\n"
            f"Please visit the SkillBridge portal to verify your eligibility and apply before the deadline:\n"
            f"{frontend_base}/student/opportunities\n\n"
            f"Best regards,\n"
            f"Training & Placement Office (TPO)\n"
            f"SkillBridge Portal"
        )

        html_email = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <div style="background-color: #14213D; padding: 16px; border-radius: 8px; text-align: center; color: white;">
                <h2 style="margin: 0; color: #00BFA6;">SkillBridge Campus Placement Drive</h2>
                <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">Official Institutional Placement Announcement</p>
            </div>
            <div style="padding: 20px 0;">
                <h3 style="color: #14213D; margin-top: 0;">{company_name} is Visiting Campus!</h3>
                <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                    The Training and Placement Office has announced a new recruitment drive for graduating students.
                </p>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Job Role:</td>
                        <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">{role_title}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Package (CTC):</td>
                        <td style="padding: 8px 0; color: #00BFA6; font-weight: 700; font-size: 15px;">₹{ctc} LPA</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Min CGPA:</td>
                        <td style="padding: 8px 0; color: #0f172a;">{min_cgpa} CGPA</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Eligible Branches:</td>
                        <td style="padding: 8px 0; color: #0f172a;">{branches}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Drive Date:</td>
                        <td style="padding: 8px 0; color: #0f172a;">{drive_date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Deadline:</td>
                        <td style="padding: 8px 0; color: #e11d48; font-weight: 600;">{deadline}</td>
                    </tr>
                </table>
                <div style="text-align: center; margin-top: 25px;">
                    <a href="{frontend_base}/student/opportunities" style="background-color: #00BFA6; color: #14213D; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 14px;">
                        Check Eligibility & Apply Now
                    </a>
                </div>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
                SkillBridge • Academia-Industry Collaboration & Placement Portal
            </div>
        </div>
        """

        wa_message = (
            f"🚀 *New Campus Placement Drive Announced!*\n\n"
            f"🏢 *Company:* {company_name}\n"
            f"💼 *Role:* {role_title}\n"
            f"💰 *Package (CTC):* ₹{ctc} LPA\n"
            f"🎓 *Min CGPA:* {min_cgpa}\n"
            f"📚 *Eligible Branches:* {branches}\n"
            f"📅 *Drive Date:* {drive_date}\n"
            f"⏳ *Deadline:* {deadline}\n\n"
            f"👉 Apply now on SkillBridge: {frontend_base}/student/opportunities"
        )

        # 1. In-App Notification Broadcast
        NotificationService.broadcast_to_role(
            target_role='student',
            title=f"New Campus Drive: {company_name}",
            message=f"{company_name} is hiring for '{role_title}' with CTC ₹{ctc} LPA. Min CGPA: {min_cgpa}. Eligible: {branches}.",
            notification_type='placement_drive',
            link='/student/opportunities'
        )

        # 2. Gather Students for Multi-Channel Dispatch (Email & WhatsApp)
        try:
            users_col = get_collection('users')
            profiles_col = get_collection('student_profiles')

            students = list(users_col.find({'role': 'student', 'is_active': True}))
            profiles = list(profiles_col.find({}))
            profiles_map = {str(p.get('user_id')): p for p in profiles}

            dispatched_emails = 0
            dispatched_wa = 0

            for st in students:
                student_id = str(st.get('id') or st.get('_id'))
                student_email = st.get('email')
                student_phone = st.get('phone') or profiles_map.get(student_id, {}).get('phone')

                # Send Email
                if student_email:
                    if cls.send_email_notification(student_email, subject, plain_email, html_message=html_email):
                        dispatched_emails += 1

                # Send WhatsApp
                if student_phone:
                    if cls.send_whatsapp_notification(student_phone, wa_message, metadata={'drive_id': drive_doc.get('id'), 'company': company_name, 'package': f"₹{ctc} LPA"}):
                        dispatched_wa += 1

            AuditService.log_event(
                action='Placement Drive Multi-Channel Broadcast',
                actor_role='tpo',
                actor_name='TPO System',
                resource_type='placement_drive',
                resource_id=drive_doc.get('id', ''),
                details=f"Dispatched alerts for {company_name}: {dispatched_emails} emails, {dispatched_wa} WhatsApp messages."
            )
            logger.info(f"[Multi-Channel Broadcast] Drive {company_name}: {dispatched_emails} emails, {dispatched_wa} WhatsApp messages sent.")
        except Exception as e:
            logger.error(f"[Broadcast Error] Failed multi-channel dispatch: {e}")

    @classmethod
    def notify_training_registration(cls, student_info, training_doc):
        """
        Notify student when registered for a TPO training bootcamp.
        """
        title = training_doc.get('title', 'Training Program')
        trainer = training_doc.get('trainer_name', 'Industry Expert')
        start_date = training_doc.get('start_date', 'Upcoming')
        student_email = student_info.get('email')
        student_phone = student_info.get('phone')

        subject = f"✅ [SkillBridge Training] Registration Confirmed: {title}"
        plain_msg = (
            f"Dear {student_info.get('name', 'Student')},\n\n"
            f"You have successfully registered for the training program:\n\n"
            f"• Program: {title}\n"
            f"• Trainer: {trainer}\n"
            f"• Start Date: {start_date}\n\n"
            f"Login to your SkillBridge account to access training resources: http://localhost:5173/student/trainings\n\n"
            f"Best regards,\nTPO Office"
        )

        wa_msg = (
            f"🎉 *Bootcamp Registration Confirmed!*\n\n"
            f"You are officially enrolled in *{title}*.\n"
            f"👨‍🏫 *Trainer:* {trainer}\n"
            f"📅 *Starts:* {start_date}\n\n"
            f"Check your student portal for syllabus: http://localhost:5173/student/trainings"
        )

        if student_email:
            cls.send_email_notification(student_email, subject, plain_msg)

        if student_phone:
            cls.send_whatsapp_notification(student_phone, wa_msg, metadata={'training_id': training_doc.get('id')})

    @classmethod
    def notify_interview_scheduled(cls, candidate_info, interview_doc):
        """
        Notify student when an interview is scheduled by a recruiter/company.
        Dispatches multi-channel notification (In-app, WhatsApp, and Email) with direct video link.
        """
        company_name = interview_doc.get('company_name', 'Recruiter')
        role_title = interview_doc.get('role_title', 'Software Engineer')
        round_name = interview_doc.get('round_name', 'Technical Screening')
        interview_date = interview_doc.get('interview_date', 'Upcoming')
        interview_time = interview_doc.get('interview_time', '10:00 AM IST')
        meeting_link = interview_doc.get('meeting_link') or 'https://meet.google.com/skb-tech-intv'
        student_id = candidate_info.get('id') or candidate_info.get('_id')
        student_email = candidate_info.get('email')
        student_phone = candidate_info.get('phone')
        student_name = candidate_info.get('name', 'Candidate')
        frontend_base = os.getenv('FRONTEND_URL', 'https://skillbridge-gold-one.vercel.app').rstrip('/')

        # 1. In-App Notification with Direct Meeting Link metadata
        NotificationService.send_notification(
            recipient_id=str(student_id),
            title=f"🎯 Interview Invitation: {company_name}",
            message=f"You are invited for '{round_name}' for '{role_title}' on {interview_date} at {interview_time}. Video Meeting Link: {meeting_link}",
            notification_type='interview_scheduled',
            link='/student/applications',
            metadata={
                'interview_id': interview_doc.get('id'),
                'meeting_link': meeting_link,
                'company_name': company_name,
                'role_title': role_title,
                'interview_date': interview_date,
                'interview_time': interview_time,
                'round_name': round_name
            }
        )

        # 2. WhatsApp Notification
        if student_phone:
            wa_text = (
                f"🎯 *[SkillBridge Interview Invitation]*\n\n"
                f"🏢 *Company:* {company_name}\n"
                f"💼 *Role:* {role_title}\n"
                f"📋 *Round:* {round_name}\n"
                f"📅 *Date:* {interview_date}\n"
                f"⏰ *Time:* {interview_time}\n"
                f"🎥 *Join Google Meet / Video Call:* {meeting_link}\n\n"
                f"👉 View & prepare on SkillBridge: {frontend_base}/student/applications"
            )
            cls.send_whatsapp_notification(student_phone, wa_text, metadata={
                'company': company_name,
                'package': f"{role_title} Interview"
            })

        # 3. Email Notification
        if student_email:
            subject = f"🎯 [SkillBridge] Interview Scheduled with {company_name} for {role_title}"
            plain_email = (
                f"Dear {student_name},\n\n"
                f"Congratulations! {company_name} has scheduled an interview with you on SkillBridge:\n\n"
                f"• Company: {company_name}\n"
                f"• Job Role: {role_title}\n"
                f"• Round: {round_name}\n"
                f"• Date: {interview_date}\n"
                f"• Time: {interview_time}\n"
                f"• Video Meeting Link: {meeting_link}\n\n"
                f"Please join 5 minutes before the scheduled time using the meeting link above.\n\n"
                f"Best regards,\n"
                f"Talent Acquisition Team • {company_name}\n"
                f"SkillBridge Portal: {frontend_base}/student/applications"
            )
            html_email = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="background-color: #14213D; padding: 18px; border-radius: 8px; text-align: center; color: white;">
                    <h2 style="margin: 0; color: #00BFA6;">Official Interview Invitation</h2>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #cbd5e1;">{company_name} Recruitment Pipeline</p>
                </div>
                <div style="padding: 20px 0;">
                    <p style="font-size: 14px; color: #334155;">Hello <strong>{student_name}</strong>,</p>
                    <p style="font-size: 14px; color: #334155;">
                        Your profile and competencies matched our requirements! You have been invited for an interview.
                    </p>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px;">
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Job Role:</td>
                            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">{role_title}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Round:</td>
                            <td style="padding: 8px 0; color: #0f172a;">{round_name}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Date & Time:</td>
                            <td style="padding: 8px 0; color: #00BFA6; font-weight: 700;">{interview_date} at {interview_time}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Meeting Platform:</td>
                            <td style="padding: 8px 0; color: #2563eb; font-weight: 600;">Google Meet / Video Room</td>
                        </tr>
                    </table>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="{meeting_link}" target="_blank" style="background-color: #00BFA6; color: #14213D; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; font-size: 14px;">
                            Join Video Interview
                        </a>
                    </div>
                </div>
            </div>
            """
            cls.send_email_notification(student_email, subject, plain_email, html_message=html_email)
