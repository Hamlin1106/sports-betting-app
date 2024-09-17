import Link from 'next/link';
import React from 'react';
import { SportsNavigation } from '../SportsNavigation';
const Banner = () => {
   return (
      <>
         <div className="banner-section">
            <div className="container">
               <div className="banner-items">
                  <div className="banner-content banner-bg-two">
                     <h1>10% Live-betting Bonus</h1>
                     <h2>10% up to €150</h2>
                     <button className='betting_start' data-bs-toggle="modal" data-bs-target="#exampleModal3">Get Started</button>
                  </div>
               </div>
            </div>
         </div>
         <SportsNavigation />
      </>

   );
};

export default Banner;
