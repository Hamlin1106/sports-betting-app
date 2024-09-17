'use client'

import { useChain, type ChainId } from '@azuro-org/sdk'
import { useChains } from 'wagmi'


export function SelectAppChain() {
  const { appChain, setAppChainId } = useChain()
  const chains = useChains()

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAppChainId(+event.target.value as ChainId)
  }

  return (
    <select className='mr-4 cursor-pointer changewallet' value={appChain.id} onChange={handleChange}>
      {
        chains.map((chain) => (
          <option className="chainname" key={chain.id} value={chain.id}>{chain.name.toUpperCase()}</option>
        ))
      }
    </select>
  )
}