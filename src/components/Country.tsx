'use client'

import { SportsQuery } from '@azuro-org/sdk'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import cx from 'clsx'
import { findCountryCodeByName } from '../utils/countryUtils';
import { League } from './League'


type CountryProps = {
  className?: string
  sportSlug: string
  country: SportsQuery['sports'][0]['countries'][0]
}

export function Country(props: CountryProps) {
  const { className, sportSlug, country } = props
  const { leagues } = country

  const params = useParams()

  const isCountryPage = params.country
  const isLeaguePage = params.league
  const countryCode = findCountryCodeByName(country.name)
  return (
    <div className='table-wrap mb-20 pb-10'>
      <div className="country_type">
        {/* <div className="country_icon">
          {
            countryCode ? (
              <img src={`/img/country_name/${countryCode}.png`} alt="" />
            ) : (
              <img src={`/img/country_name/person.png`} alt="" />
            )
          }
        </div> */}
        <p className='country_name'>{country.name}</p>
      </div>
      {
        leagues.map(league => (
          <League
            key={league.slug}
            className="table-wrap mb-40 pb-10"
            league={league}
            sportSlug={sportSlug}
            countryName={country.name}
            countrySlug={country.slug}
          />
        ))
      }
    </div>
  )
}
