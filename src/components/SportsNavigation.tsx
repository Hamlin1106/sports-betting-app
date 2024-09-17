'use client'

import { useSportsNavigation } from '@azuro-org/sdk'
import Link from 'next/link';

export function SportsNavigation() {
  const { loading, sports } = useSportsNavigation({
    withGameCount: true,
  })

  if (loading) {
    return <div className='loader'></div>
  }
  // it's simple sort by games count, you can implement your own
  const sortedSports = [...sports || []].sort((a, b) => b.games!.length - a.games!.length)
  const imagename = [
    'Basketball',
    'Cricket',
    'esport',
    'Football',
    'live',
    'parcents',
    'promotion',
    'Tennis'
  ]

  return (
    <div className="banner-feature">
      <div className="container">
        <div className="banner-feature-wrapper">
          <Link href="/" className="banner-feature-items  wow animate__animated animate__flipInY" data-wow-duration="2s" data-wow-delay="1s" data-wow-offset="100" data-wow-iteration="3">
            <div className="alertnumber">
              <p>all</p>
            </div>
            <span className="banner-feauter-thumb">
              <img src="/img/banner-freature/promotion.svg" alt="feature" />
            </span>
            <span className="banner-feature-contentt">
              Top
            </span>
          </Link>

          {
            sortedSports.map(({ slug, name, games }) => (
              <Link href={`/events/${slug}`} className="banner-feature-items wow animate__animated animate__flipInY" data-wow-duration="2s" data-wow-delay="1s" data-wow-offset="100" data-wow-iteration="3" key={slug}>
                <div className="alertnumber">
                  {
                    games && (
                      <p className="pl-1.5 text-zinc-400">{games.length}</p>
                    )
                  }
                </div>
                <span className="banner-feauter-thumb">
                  {imagename.includes(name) ? (
                    <img src={`/img/banner-freature/${name.toLowerCase()}.svg`} alt={name} />
                  ) : (
                    <img src="/img/banner-freature/football.svg" alt="feature" />
                  )}
                </span>
                <span className="banner-feature-contentt">
                  {name}

                </span>
              </Link>
            ))
          }
          <div className="flex-none w-3 h-4" />
        </div>
      </div>
    </div>
  )
}
