import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import React, { useEffect } from 'react'
import { Inter } from 'next/font/google'
import { Providers, Header } from '@/components'
import Layout from '@/components/Layout'

import 'bootstrap/dist/css/bootstrap.css';
import '@rainbow-me/rainbowkit/styles.css';
import "@/styles/main.scss"
import { Betslip } from '@/components/Betslip'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'BOOKMAKER.NINJA | Sports Betting App',
}

export default function RootLayout(props: { children: React.ReactNode }) {
    const { children } = props
    const cookieStore = cookies()


    const initialChainId = cookieStore.get('appChainId')?.value
    const initialLiveState = JSON.parse(cookieStore.get('live')?.value || 'false')

    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="/glyphter/css/Glyphter.css" />
                <link rel="stylesheet" href="/glyphter/css/custom.css" />
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js" strategy="lazyOnload" />
                <script dangerouslySetInnerHTML={{ __html: "new WOW().init();" }} />
            </head>
            <body className={inter.className}>
                <Providers initialChainId={initialChainId} initialLiveState={initialLiveState}>
                    <Layout>
                        {children}
                    </Layout>
                </Providers>
            </body>
        </html>
    )
}

