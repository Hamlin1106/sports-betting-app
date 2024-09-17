'use client'

import { type MarketOutcome, useSelection, useBaseBetslip } from '@azuro-org/sdk'
import { Button } from 'bootstrap'
import cx from 'clsx'


type OutcomeProps = {
  className?: string
  outcome: MarketOutcome
}

export function OutcomeButton(props: OutcomeProps) {
  const { className, outcome } = props

  const { items, addItem, removeItem } = useBaseBetslip()
  const { odds, isLocked, isOddsFetching } = useSelection({
    selection: outcome,
    initialOdds: outcome.odds,
    initialStatus: outcome.status,
  })

  const isActive = Boolean(items?.find((item) => {
    const propsKey = `${outcome.coreAddress}-${outcome.lpAddress}-${outcome.gameId}-${outcome.conditionId}-${outcome.outcomeId}`
    const itemKey = `${item.coreAddress}-${item.lpAddress}-${item.game.gameId}-${item.conditionId}-${item.outcomeId}`

    return propsKey === itemKey
  }))

  const buttonClassName = cx(` ${className}`, {
    'bg-slate-200 hover:bg-slate-300 red_state': isActive,
    'bg-zinc-50 hover:bg-zinc-100': !isActive,
  })

  const handleClick = () => {
    const item = {
      gameId: String(outcome.gameId),
      conditionId: String(outcome.conditionId),
      outcomeId: String(outcome.outcomeId),
      coreAddress: outcome.coreAddress,
      lpAddress: outcome.lpAddress,
      isExpressForbidden: outcome.isExpressForbidden,
    }
    if (isActive) {
      removeItem(String(outcome.gameId))
    } else {
      addItem(item)
    }
  }

  return (
    <>
      {
        isLocked ? (
          <button
            className='locked'
            disabled={isLocked}
          >
            <span className='list'>{outcome.selectionName}</span>
            <span className='num'><img src="/img/lock.png" alt="" /></span>
          </button>
        ) : (
          <button
            className={buttonClassName}
            onClick={handleClick}
            disabled={isLocked}
          >
            <span className="text-zinc-500 list">{outcome.selectionName}</span>
            <span className="font-medium num">{isOddsFetching ? '--' : odds.toFixed(2)}</span>
          </button>
        )
      }
    </>
  )

}
