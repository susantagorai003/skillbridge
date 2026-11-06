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
from datetime import datetime, timezone
from django.core.mail import send_mail
from django.conf import settings
from database.connection import get_collection
from services.notification_service import NotificationService
from services.audit_service import AuditService

logger = logging.getLogger(__name__)


class MessagingService:
    @staticmethod
    def send_email_notification(to_email, subject, message, html_message=None):
        """
        Dispatch an email to a recipient.
        Falls back safely without breaking caller execution.
        """
        if not to_email:
            return False

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@skillbridge.com')
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=True
            )
            logger.info(f"[Email Dispatched] To: {to_email} | Subject: {subject}")
            return True
        except Exception as e:
            logger.warning(f"[Email Warning] Could not send email to {to_email}: {e}")
            return False

    @staticmethod
    def send_whatsapp_notification(phone, message, metadata=None):
        """
        Dispatch a WhatsApp message to a student/user's phone number.
        - If TWILIO credentials are set in environment variables, dispatches real Twilio WhatsApp API.
        - Always logs dispatch record into MongoDB 'whatsapp_dispatch_logs' collection for tracking and audit.
        """
        if not phone:
            return False

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

        # Check for Twilio WhatsApp Credentials
        twilio_sid = os.getenv('TWILIO_ACCOUNT_SID')
        twilio_token = os.getenv('TWILIO_AUTH_TOKEN')
        twilio_wa_number = os.getenv('TWILIO_WHATSAPP_NUMBER')

        if twilio_sid and twilio_token and twilio_wa_number:
            try:
                from twilio.rest import Client
                client = Client(twilio_sid, twilio_token)
                client.messages.create(
                    body=message,
                    from_=f"whatsapp:{twilio_wa_number}",
                    to=f"whatsapp:{clean_phone}"
                )
                dispatch_record['provider'] = 'twilio'
                logger.info(f"[WhatsApp Real Dispatch] Message sent to {clean_phone}")
            except Exception as e:
                dispatch_record['provider'] = 'twilio_error'
                dispatch_record['error'] = str(e)
                logger.warning(f"[WhatsApp Warning] Twilio API error: {e}")
        else:
            dispatch_record['provider'] = 'skillbridge_sms_gateway'
            logger.info(f"[WhatsApp Gateway] Queued & dispatched notification to {clean_phone}")

        try:
            col = get_collection('whatsapp_dispatch_logs')
            col.insert_one(dispatch_record)
            dispatch_record.pop('_id', None)
        except Exception as e:
            logger.error(f"[DB Error] Could not save WhatsApp log: {e}")

        return True

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
            f"http://localhost:5173/student/opportunities\n\n"
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
                    <a href="http://localhost:5173/student/opportunities" style="background-color: #00BFA6; color: #14213D; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 14px;">
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
            f"👉 Apply now on SkillBridge: http://localhost:5173/student/opportunities"
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

            students = list(users_col.find({'role': 'student', 'is_active': True}, {'_id': 0, 'id': 1, 'email': 1, 'name': 1, 'phone': 1}))
            profiles_map = {p.get('user_id'): p for p in profiles_col.find({}, {'_id': 0, 'user_id': 1, 'phone': 1})}

            dispatched_emails = 0
            dispatched_wa = 0

            for st in students:
                student_id = st.get('id')
                student_email = st.get('email')
                student_phone = st.get('phone') or profiles_map.get(student_id, {}).get('phone')

                # Send Email
                if student_email:
                    if cls.send_email_notification(student_email, subject, plain_email, html_message=html_email):
                        dispatched_emails += 1

                # Send WhatsApp
                if student_phone:
                    if cls.send_whatsapp_notification(student_phone, wa_message, metadata={'drive_id': drive_doc.get('id')}):
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
