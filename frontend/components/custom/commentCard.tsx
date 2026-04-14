import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Alert, AlertTitle } from '../ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import MarkdownPreview from './MarkdownPreview'
import { Separator } from '../ui/separator'


interface commentCardTypes {
    userName: string
    comment: string

}

export const CommentCard = ({ userName, comment }: commentCardTypes) => {
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
                            alt="Sarah Chen"
                        />
                        <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <AlertTitle className="flex items-center gap-2">
                        <span className="truncate">{userName}</span>
                    </AlertTitle>
                </Alert>
                <CardContent>
                    <MarkdownPreview content={comment} />
                </CardContent>
            </CardContent>
        </Card>
    )
}
