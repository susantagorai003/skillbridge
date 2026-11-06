import { Bell } from 'lucide-react'

export default function NotificationBell({ count = 0, onClick }) {
  return (
    <button onClick={onClick} className="relative p-2 rounded-lg hover:bg-ivory transition-colors">
      <Bell size={20} className="text-charcoal" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
