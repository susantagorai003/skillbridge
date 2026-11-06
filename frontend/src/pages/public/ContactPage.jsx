import { useForm } from 'react-hook-form'
import { Mail, MapPin, Phone } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const onSubmit = (data) => { alert('Message sent! (Demo)') }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="font-heading font-extrabold text-4xl text-charcoal mb-4">Contact Us</h1>
          <p className="text-sage-dark text-lg">Have questions? We'd love to hear from you.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Name" placeholder="Your name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
              <Input label="Email" type="email" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Message</label>
                <textarea rows={5} placeholder="Your message..." {...register('message', { required: true })}
                  className="w-full px-4 py-2.5 bg-white border border-warm-border rounded-lg text-sm focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none" />
              </div>
              <Button type="submit">Send Message</Button>
            </form>
          </div>
          <div className="space-y-6">
            <div className="bg-ivory rounded-2xl p-6 border border-warm-border">
              <Mail size={20} className="text-terracotta mb-3" />
              <h3 className="font-heading font-bold text-charcoal mb-1">Email</h3>
              <p className="text-sage-dark text-sm">hello@skillbridge.com</p>
            </div>
            <div className="bg-ivory rounded-2xl p-6 border border-warm-border">
              <Phone size={20} className="text-terracotta mb-3" />
              <h3 className="font-heading font-bold text-charcoal mb-1">Phone</h3>
              <p className="text-sage-dark text-sm">+91 98765 43210</p>
            </div>
            <div className="bg-ivory rounded-2xl p-6 border border-warm-border">
              <MapPin size={20} className="text-terracotta mb-3" />
              <h3 className="font-heading font-bold text-charcoal mb-1">Location</h3>
              <p className="text-sage-dark text-sm">India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
