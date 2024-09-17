'use client'
import { useTheme } from 'next-themes';
import Head from 'next/head';
import { useSports, type UseSportsProps, Game_OrderBy, OrderDirection } from '@azuro-org/sdk';
import { useSportsNavigation } from '@azuro-org/sdk';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';


import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { ReactNode, useId, useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import cx from 'clsx'
import {
  ConditionStatus,
  useBaseBetslip,
  useBetTokenBalance,
  useChain,
  useDetailedBetslip,
  BetslipDisableReason,
  useLiveBetFee,
  usePrepareBet,
} from '@azuro-org/sdk'
import { getMarketName, getSelectionName } from '@azuro-org/dictionaries'
import { useAccount } from 'wagmi'
import dayjs from 'dayjs'
import { SelectAppChain } from './SelectAppChain';

import { useBetslip } from '@/context/betslip'
import { LiveSwitcher } from './LiveSwitcher';

interface Option {
  value: string;
  label: string;
}
const options = [
  { value: 'EN', label: 'EN' },
  { value: 'JP', label: 'JP' },
];
const langOptions = [
  { value: 'English', label: 'English' },
  { value: 'Japanese', label: 'Japanese' },
]
const decimalOptions = [
  { value: 'Decimal', label: 'Decimal' },
  { value: 'Odds', label: 'Odds' }
]
type Props = {
  children: ReactNode;
  // Other props
}

function AmountInput() {
  const { betAmount, changeBetAmount, maxBet, minBet } = useDetailedBetslip()
  const { betToken } = useChain()
  const { loading: isBalanceFetching, balance } = useBetTokenBalance()

  return (
    <div className="border-t border-zinc-300 space-y-2 bet_input">

      {
        Boolean(maxBet) && <div className="flex items-center justify-between">
          <span className="text-md text-zinc-400">Max bet amount:</span>
          <span className="text-md font-semibold">{maxBet} {betToken.symbol}</span>
        </div>
      }
      {
        Boolean(minBet) && <div className="flex items-center justify-between">
          <span className="text-md text-zinc-400">Min bet amount:</span>
          <span className="text-md font-semibold">{minBet} {betToken.symbol}</span>
        </div>
      }
      <div className="flex items-center justify-between">
        <input
          className="bet_amount"
          type="number"
          placeholder="Bet amount"
          value={betAmount}
          onChange={(event) => changeBetAmount(event.target.value)}
        />
      </div>
    </div>
  )
}

const submit = () => {
  alert()
  const now = Date.now();
  const deadline = 30; // bet deadline in seconds

  interface OrderSpec {
    bet: {
      attention: string;
      affiliate: string;
      core: string;
      amount: string;
      chainId: number;
      conditionId: string;
      outcomeId: number;
      minOdds: string;
      nonce: string;
      expiresAt: number;
      relayerFeeAmount: string;
    }
  }

  const order: OrderSpec = {
    bet: {
      attention: 'By signing this transaction, I agree to place a bet…', // A text to capture user consent (up to 160 chars)
      affiliate: '0x...', // Your wallet address to earn rewards
      core: '0x...', // Address of LiveCore smart contract
      amount: '15000000', // 15 USDT with 6 decimals
      chainId: 80002, // Polygon Amoy testnet chain id
      conditionId: '123456789',
      outcomeId: 29,
      minOdds: '1980000000000', // Min odds, 1.98 with 12 decimals
      nonce: String(now), // Unique (for the bettor wallet) increase-only integer
      expiresAt: Math.round(now / 1000 + deadline), // Timestamp in seconds
      relayerFeeAmount: '100000', // 0.1 USDT with 6 decimals
    }
  };
}

const errorPerDisableReason = {
  [BetslipDisableReason.ComboWithForbiddenItem]: 'One or more conditions can\'t be used in combo',
  [BetslipDisableReason.BetAmountGreaterThanMaxBet]: 'Bet amount exceeds max bet',
  [BetslipDisableReason.BetAmountLowerThanMinBet]: 'Bet amount lower than min bet',
  [BetslipDisableReason.ComboWithLive]: 'Live outcome can\'t be used in combo',
  [BetslipDisableReason.ConditionStatus]: 'One or more outcomes have been removed or suspended. Review your betslip and remove them.',
  [BetslipDisableReason.PrematchConditionInStartedGame]: 'Game has started',
} as const

const SubmitButton: React.FC = () => {
  const { appChain, isRightNetwork } = useChain()
  const { items, clear } = useBaseBetslip()
  const { betAmount, odds, totalOdds, isStatusesFetching, isOddsFetching, isBetAllowed } = useDetailedBetslip()
  const { loading: isBalanceFetching, balance } = useBetTokenBalance()
  const {
    submit,
    approveTx,
    betTx,
    isRelayerFeeLoading,
    isAllowanceLoading,
    isApproveRequired,
  } = usePrepareBet({
    betAmount,
    slippage: 10,
    affiliate: '0x0000000000000000000000000000000000000000', // your affiliate address
    selections: items,
    odds,
    totalOdds,
    onSuccess: () => {
      clear()
    },
  })

  const isPending = approveTx.isPending || betTx.isPending
  const isProcessing = approveTx.isProcessing || betTx.isProcessing

  if (!isRightNetwork) {
    return (
      <div className="mt-6 py-3.5 text-center bg-red-200 rounded-2xl">
        Switch network to <b>{appChain.name}</b> in your wallet
      </div>
    )
  }

  const isEnoughBalance = isBalanceFetching || !Boolean(+betAmount) ? true : Boolean(+balance! > +betAmount)

  const isLoading = (
    isOddsFetching
    || isBalanceFetching
    || isStatusesFetching
    || isAllowanceLoading
    || isPending
    || isProcessing
    || isRelayerFeeLoading
  )

  const isDisabled = (
    isLoading
    || !isBetAllowed
    || !isEnoughBalance
    || !+betAmount
  )

  let title

  if (isPending) {
    title = 'Waiting for approval'
  }
  else if (isProcessing) {
    title = 'Processing...'
  }
  else if (isLoading) {
    title = 'Loading...'
  }
  else if (isApproveRequired) {
    title = 'Approve'
  }
  else {
    title = 'Place Bet'
  }

  return (
    <div className="mt-6">
      {
        !isEnoughBalance && (
          <div className="mb-1 text-red-500 text-center font-semibold">
            Not enough balance.
          </div>
        )
      }
      <button
        className="placing_button"
        disabled={isDisabled}
        onClick={submit}
      >
        {title}
      </button>
    </div>
  )
}


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
}


export default function Layout({ children }: Props) {
  const { changeBetAmount, maxBet, minBet } = useDetailedBetslip()

  const { betToken } = useChain()
  const { loading: isBalanceFetching, balance } = useBetTokenBalance()
  const account = useAccount()
  const { items, clear, removeItem } = useBaseBetslip()
  const { betAmount, odds, totalOdds, statuses, disableReason, isStatusesFetching, isOddsFetching, isLiveBet } = useDetailedBetslip()
  const { formattedRelayerFeeAmount, loading: isRelayerFeeLoading } = useLiveBetFee({
    enabled: isLiveBet,
  })



  const handleclick = () => {
    setOpenMenu(false)
  }
  const handleclick2 = () => {
    setOpenMenu2(false)
  }
  const { loading, sports } = useSportsNavigation({
    withGameCount: true,
  })
  const sortedSports = [...sports || []].sort((a, b) => b.games!.length - a.games!.length)
  console.log(sortedSports)
  const { theme, setTheme } = useTheme();
  const [selectedOption, setSelectedOption] = useState<Option | null | unknown>(options[0]);
  const [selectedLangOption, setSelectedLangOption] = useState<Option | null | unknown>(langOptions[0]);
  const [selectedDacimalOption, setSelectedDacimalOption] = useState<Option | null | unknown>(decimalOptions[0]);
  const [openMenu, setOpenMenu] = useState(false)
  const [openMenu2, setOpenMenu2] = useState(false)
  const inactiveTheme = theme === "light" ? "dark" : "light";
  // const { pathname } = useRouter()
  const pathname = usePathname()
  const customStyles: StylesConfig = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme !== "dark" ? "#1F493F" : "#D5DDEC",
      borderColor: '#1F493F',
      border: state.isFocused ? '0' : '0',
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? '#ffffff' : '#000',
      backgroundColor: state.isSelected ? '#1F493F' : '#ffffff'
    }),
    singleValue: base => ({
      ...base,
      color: theme !== "dark" ? "#fff" : "#000",
      border: 'none'
    }),
  };
  const [activeTab, setActiveTab] = useState<string>('bet-slip');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const [liveItemCount, setLiveItemCount] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const fetchLiveItemCount = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/live-items-count');
      const data = await response.json();
      setLiveItemCount(data.count);
    } catch (error) {
      console.error('Error fetching live item count:', error);
    }
  };

  // Access router to get current pathname

  // Handle click event for navigation and checkbox-like behavior

  useEffect(() => {
    fetchLiveItemCount();
  }, []);

  const handleClick3 = () => {
    setIsLive(prevIsLive => !prevIsLive); // Toggle isLive
  };



  return (
    <main>
      <header className="header-section header-hidden">
        <div className="header-wrapper">
          <div className="menu-logo-adjust d-flex align-items-center pc">
            <div className="logo-menu me-5">
              <Link href="/" className="logo">
                <img src="/img/logo/logo.png" alt="logo" />
              </Link>
              <Link href="/" className="dark-logo">
                <img src="/img/logo/dark-logo.png" alt="logo" />
              </Link>
            </div>
            <div className={`header-bar ${openMenu && 'active act'}`} onClick={() => setOpenMenu(!openMenu)}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <ul className={`main-menu ${openMenu && 'active act'}`}>

              <li className="active">
                <Link href="/" onClick={handleclick}>Home</Link>
              </li>
              <li>
                <Link href="/events/football" onClick={handleclick}>Football</Link>
              </li>
              <li>
                <Link href="/events/tennis" onClick={handleclick}>Tennis</Link>
              </li>
              <li>
                <Link href="/events/cricket" onClick={handleclick}>V-Sport</Link>
              </li>
              <li>
                <Link href="/events/dota-2" onClick={handleclick}>eSports</Link>
              </li>
              <li className='menu--btn'>
                <RainbowKitProvider
                  theme={darkTheme({
                    accentColor: '#7b3fe4',
                    accentColorForeground: 'white',
                    borderRadius: 'small',
                    overlayBlur: 'small',
                  })}
                  modalSize="compact"
                >
                  <ConnectButton chainStatus="none" />
                </RainbowKitProvider>
              </li>
            </ul>
          </div>
          <div className="menu-logo-adjust d-flex align-items-center sp">
            <div className={`header-bar ${openMenu && 'active act'}`} onClick={() => setOpenMenu(!openMenu)}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="logo-menu me-5">
              <Link href="/" className="logo">
                <img src="/img/logo/logo.png" alt="logo" />
              </Link>
              <Link href="/" className="dark-logo">
                <img src="/img/logo/dark-logo.png" alt="logo" />
              </Link>
            </div>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: '#7b3fe4',
                accentColorForeground: 'white',
                borderRadius: 'small',
                overlayBlur: 'small',
              })}
              modalSize="compact"
            >
              <ConnectButton chainStatus="none" />
            </RainbowKitProvider>

            <ul className={`main-menu ${openMenu && 'active act'}`}>


              <li className="active">
                <Link href="/" onClick={handleclick}>Home</Link>
              </li>
              <li>
                <Link href="/events/football" onClick={handleclick}>Football</Link>
              </li>
              <li>
                <Link href="/events/tennis" onClick={handleclick}>Tennis</Link>
              </li>
              <li>
                <Link href="/events/cricket" onClick={handleclick}>V-Sport</Link>
              </li>
              <li>
                <Link href="/events/dota-2" onClick={handleclick}>eSports</Link>
              </li>
            </ul>
          </div>

          <div className="right-menu-reature">

            <div className="language">
              <div className='d-flex gap-2 align-items-center'>
                <div className="glo">
                  <i className="fas fa-globe"></i>
                </div>
                <Select
                  instanceId={useId()}
                  defaultValue={selectedOption}
                  onChange={setSelectedOption}
                  options={options}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  styles={customStyles}
                />
              </div>
            </div>
            {/* <div className="changewallet pc">
              <div className="changewalletimage">
                <img src="/img/setting.svg" alt="" />
              </div>
              <SelectAppChain />
            </div> */}
            <div className="livebet">
              <LiveSwitcher />
            </div>
            <div className="mode--toggle brightness_sp" onClick={() => setTheme(inactiveTheme)}>
              <img src={`/img/${theme === 'dark' ? 'moon' : 'sun'}.png`} alt="" />
            </div>
            <div className="signup-area">
              <RainbowKitProvider
                theme={darkTheme({
                  accentColor: '#7b3fe4',
                  accentColorForeground: 'white',
                  borderRadius: 'small',
                  overlayBlur: 'small',
                })}
                modalSize="compact"
              >
                <ConnectButton chainStatus="none" />
              </RainbowKitProvider>

            </div>
          </div>
        </div>
      </header>

      <div className="main-body">
        <div className="left-site-menu">
          <div className="left-box">
            <header className="header">
              <nav className={`menu wow animate__animated animate__fadeIn" data-wow-duration="2s" data-wow-delay="1s" data-wow-offset="100" data-wow-iteration="3" ${openMenu2 && 'active act'}`}>
                <ul className="main-list-menu">
                  <li>
                    <ul className="menu-promot menu-promot-first">
                      {/* <li>
                        <form action="#">
                          <input type="text" placeholder="Search........." />
                          <span className="icon">
                            <i className="fas fa-magnifying-glass"></i>
                          </span>
                        </form>
                      </li> */}
                      <li>
                        <Link href="/" className={`${pathname == '/' && 'active'}`}>
                          <div className="icon">
                            <i className="icon-home"></i>
                          </div>
                          <span>
                            Home
                          </span>
                        </Link>



                        {/* <Link href="#" className={`main-list-menu-live toggle-button ${isLive ? 'active liveactive' : ''}`}
                          onClick={handleClick3}>
                          <div className="icon">
                            <i className="icon-live"></i>
                          </div>
                          <span>
                            Live
                          </span>
                          <span className="live-watch">
                            {liveItemCount !== null ? liveItemCount : '0'}
                          </span>
                        </Link> */}


                        <div className="livesetting">
                          <LiveSwitcher />
                        </div>
                        {/* <Link href="favorites" className={`${pathname == '/favorites' && 'active'}`}>
                          <div className="icon">
                            <i className="fas fa-star"></i>
                          </div>
                          <span>
                            Fovarites
                          </span>
                        </Link> */}
                      </li>
                    </ul>
                  </li>
                  <li>
                    <ul className="menu-promot menu-promot-bottom">
                      <li className="pro">
                        Games
                      </li>
                      {
                        loading ? (
                          <div className='loader small'></div>
                        ) : (
                          <>
                            {
                              sortedSports.map((sport) => (
                                <li key={sport.name} className='wow animate__animated animate__fadeInUp' data-wow-duration="2s" data-wow-delay="1s" data-wow-offset="100" data-wow-iteration="3">
                                  <Link href={`/events/${sport.slug}`} className={`${pathname == `/${sport.name}` && 'active'}`} onClick={handleclick2}>
                                    <div className="icon">
                                      <img src={`/img/svg-icon/${sport.slug}.svg`} />
                                    </div>
                                    <span>
                                      {sport.name}
                                    </span>
                                  </Link>
                                </li>
                              ))
                            }
                          </>
                        )
                      }
                    </ul>
                  </li>
                </ul>
                <div className={`hamburger ${openMenu2 && 'active act'}`} onClick={() => setOpenMenu2(!openMenu2)}>
                  <span></span>
                </div>
                <div className={`hamb ${openMenu2 && 'active act'}`} onClick={() => setOpenMenu2(!openMenu2)}>
                  <span></span>
                </div>
                <div className={`dimmer ${openMenu2 && 'active act'}`}></div>
              </nav>
            </header>
          </div>
        </div>
        {/* <!--Left Box Menu--> */}

        {/* <!--Middle Body--> */}
        <div className="body-middle">


          {children}
          {/* // <!--Footer Section--> */}
          <footer className="footer-section">
            <div className="container">
              <div className="footer-wrapper">
                <p>
                  Copyright {new Date().getFullYear().toString()} <Link href="#0" className="text-base">OnlineBets</Link> All Rights Reserved.
                </p>
                <ul className="footer-link">
                  <li>
                    <Link href="#0">
                      Affiliate program
                    </Link>
                  </li>
                  <li>
                    <Link href="#0">
                      Terms & conditions
                    </Link>
                  </li>
                  <li>
                    <Link href="#0">
                      Bonus terms & conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </footer>
          {/* // <!--Footer Section--> */}
          <Link href="#0" className="click-btn" data-bs-toggle="modal" data-bs-target="#exampleModal3">
            <i className="icon-basketball"></i>
          </Link>
        </div>
        {/* // <!--Middle Body--> */}




        {/* // <!--Right Box Chat--> */}
        <div className="right-site-menu">
          <div className="right-box">
            <div className="right-wrapper-area">
              <div className="blance-items">
                <div className="left-blance">
                  <span><img src="/img/header/right-icon/wallet.svg" alt="icon" /></span>
                  <span className="text-blabce">Balance</span>
                </div>
                <span className="blance">
                  {
                    isBalanceFetching ? (
                      <></>
                    ) : (
                      balance !== undefined ? (
                        <>{(+balance).toFixed(2)} {betToken.symbol}</>
                      ) : (
                        <>-</>
                      )
                    )
                  }
                </span>
              </div>
              <div className="betslip-wrapper">
                <Link href="#" className={`left-betslip ${activeTab === 'bet-slip' ? 'active bet_color' : ''}`} onClick={() => handleTabChange('bet-slip')} >
                  <span className="bet_image"><img src={`/img/bet-slip/${activeTab === 'bet-slip' ? 'betslipyellow' : 'betslip'}.png`} alt="icon" /></span>
                  <span className="text-bets">Bet Slip</span>
                </Link>
                <Link href="#0" className={`left-betslip ${activeTab === 'mybet' ? 'active bet_color' : ''}`} onClick={() => handleTabChange('mybet')}>
                  <span className="bet_image"><img src={`/img/bet-slip/${activeTab === 'mybet' ? 'mybetyellow' : 'mybet'}.png`} alt="icon" /></span>
                  <span className="text-bets">My Bets</span>
                </Link>
              </div>
              <div className="tab-content combo-box">
                <div className={`tab-pane fade ${activeTab === 'bet-slip' ? 'show active' : ''}`} id="bet-slip">
                  <div className="bet_name" id="combo-tab" data-bs-toggle="tab" data-bs-target="#coombo">
                    <p>{items.length > 1 ? 'Combo' : 'Single'} bet {items.length ? `(${items.length})` : ''}</p>
                    {
                      Boolean(items.length) && (
                        <div className="allRemove">
                          <img src="/img/trush-icon/trush.png" className='allRemove' alt="" onClick={clear} />
                        </div>
                      )
                    }
                  </div>

                  {
                    Boolean(items.length) ? (

                      <div className="Betting_content">
                        <div className="tab-pane" >
                          <div className="combo-wrapper">
                            {
                              items.map(item => {
                                const { game: { gameId, sportSlug, startsAt, sportName, leagueName, participants }, conditionId, outcomeId } = item
                                const selection = getSelectionName({ outcomeId, withPoint: true })
                                const isLock = !isStatusesFetching && statuses[conditionId] !== ConditionStatus.Created

                                return (
                                  <div className="close-box" key={outcomeId}>

                                    <div className="close-items">
                                      <div className="close-head">
                                        <div className="cls-sports-icon">
                                          <img src={`/img/svg-icon/${sportSlug}.svg`} alt="" />
                                        </div>
                                        <span className='matchingteam_name'>{participants[0].name} - {participants[1].name}</span>
                                        <div className="close" onClick={() => removeItem(gameId)}>
                                          <svg className="h-3 w-3 text-teal-500" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </div>
                                      </div>
                                      <div className="match-fixing">
                                        <span className="winner">Full Time Result</span>
                                        <div className="match-items">
                                          <div className="match-items-left">
                                            <div className="cont">
                                              {selection}
                                            </div>
                                          </div>
                                          <div className="match-items-right">
                                            <div className="icon">
                                              <img src="/img/header/right-icon/uptodwon.svg" alt="icon" />
                                            </div>
                                            {
                                              isOddsFetching ? (
                                                <div className="loader small"></div>
                                              ) : (
                                                odds[`${conditionId}-${outcomeId}`]
                                              )
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='empty'>
                        <div className="emptyimage">
                          <img src="/img/nodata-icon/nodata.svg" alt="" />
                        </div>
                        <h3>Betslip is empty</h3>
                        <p>To add a bet to your betslip, choose a market and make your selection</p>
                        <button className='howtobet'>How to play ?</button>
                      </div>
                    )
                  }
                  {
                    Boolean(items.length) && (
                      <>
                        <AmountInput />
                        <div className="total-odds">
                          <span>Total Odds :</span>
                          <span className="amount">
                            {
                              isOddsFetching ? (
                                <div className='loader small'></div>
                              ) : (
                                <>{totalOdds}</>
                              )
                            }
                          </span>
                        </div>
                        <div className="possible-win">
                          <span>Possible Win :</span>
                          <span className="amount">
                            {
                              isOddsFetching ? (
                                <div className='loader small'></div>
                              ) : (
                                <>{totalOdds * +betAmount}</>
                              )
                            }
                          </span>
                        </div>
                        {
                          Boolean(disableReason) && (
                            <div className="mb-1 text-red-500 text-center font-semibold">
                              {errorPerDisableReason[disableReason!]}
                            </div>
                          )
                        }
                        {
                          account?.address ? (
                            <SubmitButton />
                          ) : (
                            <div className="text-center connect_alert">
                              Connect your wallet
                            </div>
                          )
                        }
                      </>
                    )
                  }
                </div>
                <div className={`tab-pane fade ${activeTab === 'mybet' ? 'show active' : ''}`} id="mybet">
                  <div className='empty'>
                    <div className="emptyimage">
                      <img src="/img/nodata-icon/no-data1.svg" alt="" />
                    </div>
                    <h3>No active bets</h3>
                    <p>All unsettled bets will be listed here</p>
                    <button className='howtobet'>How to place bet ?</button>
                  </div>
                </div>


              </div>

            </div>

          </div>
        </div>
        {/* // <!--Right Box Chat--> */}
      </div>


      {/* // <!--menu modal--> */}
      <div className="modal right-menu-modal fade" id="exampleModal3" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <button type="button" className="btn-close cross-btn" data-bs-dismiss="modal" aria-label="Close"></button>
            <div className="modal-body">
              <div className="right-site-menu">
                <div className="right-box">
                  <div className="right-wrapper-area">
                    <div className="blance-items">
                      <div className="left-blance">
                        <span><img src="/img/header/right-icon/wallet.svg" alt="icon" /></span>
                        <span className="text-blabce">Balance</span>
                      </div>
                      <span className="blance">
                        {
                          isBalanceFetching ? (
                            <></>
                          ) : (
                            balance !== undefined ? (
                              <>{(+balance).toFixed(2)} {betToken.symbol}</>
                            ) : (
                              <>-</>
                            )
                          )
                        }
                      </span>
                    </div>
                    <div className="betslip-wrapper">
                      <Link href="#" className={`left-betslip ${activeTab === 'bet-slip' ? 'active bet_color' : ''}`} onClick={() => handleTabChange('bet-slip')} >
                        <span className="bet_image"><img src={`/img/bet-slip/${activeTab === 'bet-slip' ? 'betslipyellow' : 'betslip'}.png`} alt="icon" /></span>
                        <span className="text-bets">Bet Slip</span>
                      </Link>
                      <Link href="#0" className={`left-betslip ${activeTab === 'mybet' ? 'active bet_color' : ''}`} onClick={() => handleTabChange('mybet')}>
                        <span className="bet_image"><img src={`/img/bet-slip/${activeTab === 'mybet' ? 'mybetyellow' : 'mybet'}.png`} alt="icon" /></span>
                        <span className="text-bets">My Bets</span>
                      </Link>
                    </div>
                    <div className="tab-content combo-box">
                      <div className={`tab-pane fade ${activeTab === 'bet-slip' ? 'show active' : ''}`} id="bet-slip">
                        <div className="bet_name" id="combo-tab" data-bs-toggle="tab" data-bs-target="#coombo">
                          <p>{items.length > 1 ? 'Combo' : 'Single'} bet {items.length ? `(${items.length})` : ''}</p>
                          {
                            Boolean(items.length) && (
                              <div className="allRemove">
                                <img src="/img/trush-icon/trush.png" className='allRemove' alt="" onClick={clear} />
                              </div>
                            )
                          }
                        </div>

                        {
                          Boolean(items.length) ? (

                            <div className="Betting_content">
                              <div className="tab-pane" >
                                <div className="combo-wrapper">
                                  {
                                    items.map(item => {
                                      const { game: { gameId, sportSlug, startsAt, sportName, leagueName, participants }, conditionId, outcomeId } = item
                                      const selection = getSelectionName({ outcomeId, withPoint: true })
                                      const isLock = !isStatusesFetching && statuses[conditionId] !== ConditionStatus.Created

                                      return (
                                        <div className="close-box" key={outcomeId}>

                                          <div className="close-items">
                                            <div className="close-head">
                                              <div className="cls-sports-icon">
                                                <img src={`/img/svg-icon/${sportSlug}.svg`} alt="" />
                                              </div>
                                              <span className='matchingteam_name'>{participants[0].name} - {participants[1].name}</span>
                                              <div className="close" onClick={() => removeItem(gameId)}>
                                                <svg className="h-3 w-3 text-teal-500" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                                              </div>
                                            </div>
                                            <div className="match-fixing">
                                              <span className="winner">Full Time Result</span>
                                              <div className="match-items">
                                                <div className="match-items-left">
                                                  <div className="cont">
                                                    {selection}
                                                  </div>
                                                </div>
                                                <div className="match-items-right">
                                                  <div className="icon">
                                                    <img src="/img/header/right-icon/uptodwon.svg" alt="icon" />
                                                  </div>
                                                  {
                                                    isOddsFetching ? (
                                                      <div className="loader small"></div>
                                                    ) : (
                                                      odds[`${conditionId}-${outcomeId}`]
                                                    )
                                                  }
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })
                                  }
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='empty'>
                              <div className="emptyimage">
                                <img src="/img/nodata-icon/nodata.svg" alt="" />
                              </div>
                              <h3>Betslip is empty</h3>
                              <p>To add a bet to your betslip, choose a market and make your selection</p>
                              <button className='howtobet'>How to play ?</button>
                            </div>
                          )
                        }
                        {
                          Boolean(items.length) && (
                            <>
                              <AmountInput />
                              <div className="total-odds">
                                <span>Total Odds :</span>
                                <span className="amount">
                                  {
                                    isOddsFetching ? (
                                      <div className='loader small'></div>
                                    ) : (
                                      <>{totalOdds}</>
                                    )
                                  }
                                </span>
                              </div>
                              <div className="possible-win">
                                <span>Possible Win :</span>
                                <span className="amount">
                                  {
                                    isOddsFetching ? (
                                      <div className='loader small'></div>
                                    ) : (
                                      <>{totalOdds * +betAmount}</>
                                    )
                                  }
                                </span>
                              </div>
                              {
                                Boolean(disableReason) && (
                                  <div className="mb-1 text-red-500 text-center font-semibold">
                                    {errorPerDisableReason[disableReason!]}
                                  </div>
                                )
                              }
                              {
                                account?.address ? (
                                  <SubmitButton />
                                ) : (
                                  <div className="text-center connect_alert">
                                    Connect your wallet
                                  </div>
                                )
                              }
                            </>
                          )
                        }
                      </div>
                      <div className={`tab-pane fade ${activeTab === 'mybet' ? 'show active' : ''}`} id="mybet">
                        <div className='empty'>
                          <div className="emptyimage spempty">
                            <img src="/img/nodata-icon/no-data1.svg" alt="" />
                          </div>
                          <h3>No active bets</h3>
                          <p>All unsettled bets will be listed here</p>
                          <button className='howtobet'>How to place bet ?</button>
                        </div>
                      </div>


                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}