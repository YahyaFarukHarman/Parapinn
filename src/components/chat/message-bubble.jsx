import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function MessageBubble({ message, userName }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex w-full gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="mt-0.5 size-8 shrink-0">
        <AvatarFallback className="text-xs">
          {isUser ? (userName ? userName[0].toUpperCase() : 'S') : 'P'}
        </AvatarFallback>
      </Avatar>
      <div className={`flex max-w-[80%] flex-col gap-1 ${isUser ? 'items-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          {message.content}
        </div>
        <span className="text-muted-foreground px-1 text-[10px]">
          {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  )
}
