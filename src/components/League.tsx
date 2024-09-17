'use client'
import { GamesQuery, SportsQuery, useGameStatus, useGameMarkets, useLive } from '@azuro-org/sdk'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { usePathname } from 'next/navigation'
import dayjs from 'dayjs'
import { OutcomeButton } from './OutcomeButton'

type GameProps = {
  className?: string
  countryName: string
  game: GamesQuery['games'][0]
  league: SportsQuery['sports'][0]['countries'][0]['leagues'][0]
}

function Game(props: GameProps) {
  const { className, countryName, game, league } = props
  const { gameId, title, sport, startsAt, status: graphStatus, } = game
  // const { isLive } = useLive()
  const current_url = usePathname();
  const isLive = current_url.includes('/live');
  // console.log(isLive);
  const { status } = useGameStatus({
    graphStatus,
    startsAt: +startsAt,
    isGameExistInLive: isLive,
  })

  console.log(sport.slug)
  const { markets } = useGameMarkets({
    gameStatus: status,
    gameId,
  })
  return (
    <div className="table-inner" key={''}>
      <div className="sp">
        <p>{dayjs(+startsAt * 1000).format('DD MMM HH:mm')}</p>
        <a href={`/event/${gameId}`}>{game['participants'][0]['name'] || ''} - {game['participants'][1]['name'] || ''}</a>
        <p>Full Time Result</p>
        <div className="table-body-right">
          {
            Boolean(markets?.[0]?.outcomeRows[0]) && (
              <>
                {
                  markets![0].outcomeRows[0].map((outcome) => (
                    // <Link href="" key={outcome.selectionName} className="table-pointing-box">
                    //   <span className="list">{outcome.selectionName}</span>
                    //   <span>{outcome.odds?.toFixed(2)}</span>
                    // </Link>
                    <OutcomeButton
                      className="table-pointing-box"
                      key={outcome.selectionName}
                      outcome={outcome}
                    />
                  ))
                }
              </>
            )
          }
          <a href={`/event/${gameId}`} className='Moreview'> &#11162; </a>
        </div>
      </div>

      <div className="pc">

        <div className="table-head">
          <Link href="details" className="left-compo">
            <span className='left-compo-image'>
              <img src={`/img/svg-icon/${sport.slug}.svg`} alt="icon" />
            </span>
            <span>{league.name}</span>

          </Link>
          <ul className="right-compo">
            <li>Full Time Result</li>
          </ul>
        </div>
        <div className="table-body">
          <ul className="table-body-left">
            <li>
              <Link href={`/event/${gameId}`}>
                <span>{game['participants'][0]['name']}</span>
                <span className="icon">
                  <img src={game.participants[0]['image'] || ''} alt="flag" className='imgsize' />
                </span>
              </Link>
            </li>
            <li>
              <Link href={`/event/${gameId}`} className="vs">
                VS
              </Link>
            </li>
            <li>
              <Link href={`/event/${gameId}`}>
                <span className="icon">
                  <img src={game['participants'][1]['image'] || ''} alt="flag" className='imgsize' />
                </span>
                <span>{game['participants'][1]['name'] || ''}</span>
              </Link>
            </li>
          </ul>
          <div className="table-body-right">
            {
              Boolean(markets?.[0]?.outcomeRows[0]) && (
                <>
                  {
                    markets![0].outcomeRows[0].map((outcome) => (
                      // <Link href="" key={outcome.selectionName} className="item table-pointing-box">
                      //   <span className="list">{outcome.selectionName}</span>
                      //   <span>{outcome.odds?.toFixed(2)}</span>
                      // </Link>
                      <OutcomeButton
                        className="table-pointing-box"
                        key={outcome.selectionName}
                        outcome={outcome}
                      />
                    ))
                  }
                </>
              )
            }
            <Link href={`/event/${gameId}`} className="table-pointing-box">
              More =&gt;
            </Link>

          </div>
        </div>
      </div>


    </div>
  )
}

type LeagueProps = {
  className?: string
  sportSlug: string
  countryName: string
  countrySlug: string
  league: SportsQuery['sports'][0]['countries'][0]['leagues'][0]
}

export function League(props: LeagueProps) {
  const { className, sportSlug, countryName, countrySlug, league } = props
  const { games } = league

  const params = useParams()

  const isLeaguePage = params.league

  return (
    <>
      <div>
        {/* {
          isLeaguePage && (
            <>
              <Link
                className="hover:underline w-fit"
                href={`/events/${sportSlug}/${countrySlug}`}
              >
                
              </Link>
              <div className="mx-2">&middot;</div>
            </>
          )
        }
        <Link
          className="hover:underline w-fit"
          href={`/events/${sportSlug}/${countrySlug}/${league.slug}`}
        >
          {league.name}
        </Link> */}
      </div>
      {
        games.map(game => (
          <Game
            key={game.gameId}
            className="mt-2 first-of-type:mt-0"
            game={game}
            countryName={countryName}
            league={league}
          />
        ))
      }
    </>
  )
}
