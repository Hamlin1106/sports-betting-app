'use client'

import React from 'react'
import { AzuroSDKProvider, ChainId } from '@azuro-org/sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultWallets, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { arbitrum, polygon, gnosis, spicy, arbitrumSepolia } from 'viem/chains'

import { ThemeProvider } from 'next-themes';
import { BetslipProvider } from '@/context/betslip'


const { wallets } = getDefaultWallets()

const chains = [
  polygon,
] as const

const wagmiConfig = getDefaultConfig({
  appName: 'Bookmaker',
  projectId: '8932bc789fd24a5cae84e9bcae8852f1', // get your own project ID - https://cloud.walletconnect.com/sign-in
  wallets,
  chains,
})

const queryClient = new QueryClient()

type ProvidersProps = {
  children: React.ReactNode
  initialChainId?: string
  initialLiveState?: boolean
}

export function Providers(props: ProvidersProps) {
  const { children, initialChainId, initialLiveState } = props

  const chainId = initialChainId
    ? chains.find(chain => chain.id === +initialChainId) ? +initialChainId as ChainId : polygon.id
    : polygon.id

  return (
    <ThemeProvider enableSystem={false}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <AzuroSDKProvider initialChainId={chainId} initialLiveState={initialLiveState}>
              <BetslipProvider>
                {children}
              </BetslipProvider>
            </AzuroSDKProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
