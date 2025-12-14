import { format } from 'date-fns';
import { Message } from '../../services/messageService';
import { cn } from '../ui/utils';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    return (
        <div className={cn(
            "flex w-full mb-4",
            isOwn ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                isOwn 
                    ? "bg-primary text-primary-foreground rounded-br-sm" 
                    : "bg-muted text-foreground rounded-bl-sm"
            )}>
                {!isOwn && (
                    <div className="text-xs font-semibold mb-1 opacity-80">
                        {message.senderName}
                    </div>
                )}
                <div className="text-sm whitespace-pre-wrap break-words">
                    {message.message}
                </div>
                <div className={cn(
                    "text-xs mt-1 flex items-center gap-1",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                    <span>{format(new Date(message.timestamp), 'h:mm a')}</span>
                    {isOwn && (
                        <span className={message.isRead ? "text-blue-300" : ""}>
                            {message.isRead ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

