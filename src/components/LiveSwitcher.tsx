'use client'

import type { ChangeEvent } from 'react'
import { useLive } from "@azuro-org/sdk"


export function LiveSwitcher() {
  const { isLive, changeLive } = useLive()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    changeLive(event.target.checked)
  }

  return (
    <>
      <div className="flex items-center mr-4 checklive pc">
        <div className="checkboxes__item">
          <label className="checkbox style-f">
            <input type="checkbox" checked={isLive} onChange={handleChange} />
            <div className="checkbox__checkmark"></div>
            <div className="checkbox__body">LIVE</div>
          </label>
        </div>
      </div>
      <div className='flex items-center mr-4 checklive sp'>
        <div className="checkboxes__item">
          <label className="checkbox style-e">
            <div className="checkbox__body">Live</div>
            <input type="checkbox" checked={isLive} onChange={handleChange} />
            <div className="checkbox__checkmark"></div>
          </label>
        </div>
      </div>
    </>

  )
}
