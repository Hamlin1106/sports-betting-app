'use client'
import React, { useEffect } from 'react'
import { SportsNavigation, Sport } from '@/components'
import { useParams } from 'next/navigation'
import { useSports, type UseSportsProps, Game_OrderBy, OrderDirection } from '@azuro-org/sdk'
import Banner from '@/components/home/Banner'


const useData = () => {
  const params = useParams()
  const isTopPage = params.sport === 'top'

  const props: UseSportsProps = isTopPage ? {
    gameOrderBy: Game_OrderBy.Turnover,
    filter: {
      limit: 10,
    }
  } : {
    gameOrderBy: Game_OrderBy.StartsAt,
    orderDir: OrderDirection.Asc,
    filter: {
      sportSlug: params.sport as string,
      countrySlug: params.country as string,
      leagueSlug: params.league as string,
    }
  }

  const { loading, sports } = useSports(props)

  return {
    sports,
    loading,
  }
}

export default function EventsLayout() {
  const { loading, sports } = useData()
  useEffect(() => {
    // Ensure bootstrap is only used in the client-side
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <>
      <Banner />
      {
        loading ? (
          <div className='loader'></div>
        ) : (
          <div>
            {
              sports.map((sport) => (
                <Sport key={sport.slug} sport={sport} />
              ))
            }
          </div>
        )
      }
    </>
  )
}
