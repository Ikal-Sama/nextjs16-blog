import { Navbar } from '@/components/web/Navbar'
import React from 'react'

export default function SharedLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}
