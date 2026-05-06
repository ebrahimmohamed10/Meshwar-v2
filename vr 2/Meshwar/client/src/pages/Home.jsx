import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Banner from '../components/Banner'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/Newsletter'
import RecentlyViewed from '../components/RecentlyViewed'
import RecommendedCars from '../components/RecommendedCars'

const Home = () => {
  return (
    <>
      <Hero />
      <RecentlyViewed />
      <RecommendedCars />
      <FeaturedSection />
      <Banner />
      <Testimonial />
      <Newsletter />
    </>
  )
}

export default Home
