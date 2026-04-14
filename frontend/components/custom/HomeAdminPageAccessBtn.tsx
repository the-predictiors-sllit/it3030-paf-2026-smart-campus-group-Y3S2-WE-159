"use client"
import React from 'react'
import { Alert, AlertAction, AlertTitle } from '../ui/alert'
import { ShieldCheckIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

export const HomeAdminPageAccessBtn = () => {
    const router = useRouter()
    const handleAdminNavigationClick = () => {
        router.push("/admin")
    }

    return (
        <Alert className='p-5'>
            <ShieldCheckIcon />
            <AlertTitle>Access Admin Dashboard.</AlertTitle>
            <AlertAction>
                <Button onClick={handleAdminNavigationClick}>Click</Button>
            </AlertAction>
        </Alert>
    )
}
