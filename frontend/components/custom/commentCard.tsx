import { Alert, AlertTitle } from '../ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Card, CardContent } from '../ui/card'
import MarkdownPreview from './MarkdownPreview'


interface commentCardTypes {
    userName?: string
    comment?: string
    data?: {
        userName?: string
        authorName?: string
        authorId?: string
        comment?: string
        text?: string
    }
}

export const CommentCard = ({ userName, comment, data }: commentCardTypes) => {
    const resolvedUserName = userName || data?.userName || data?.authorName || data?.authorId || 'Anonymous'
    const resolvedComment = comment || data?.comment || data?.text || ''
    return (
        <Card className='mb-5 p-2 pb-5'>
            <CardContent className="overflow-hidden p-0!">
                <Alert
                    variant="default"
                    className="grid-cols-[32px_1fr] gap-x-3 border-0 shadow-none"
                >
                    <Avatar className="border-border/10 size-8 border">
                        <AvatarImage
                            src="https://images.pexels.com/photos/1827837/pexels-photo-1827837.jpeg"
                            alt={resolvedUserName}
                        />
                        <AvatarFallback>{resolvedUserName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <AlertTitle className="flex items-center gap-2">
                        <span className="truncate">{resolvedUserName}</span>
                    </AlertTitle>
                </Alert>
                <CardContent>
                    <MarkdownPreview content={resolvedComment} />
                </CardContent>
            </CardContent>
        </Card>
    )
}
