import React from "react"
import { useTheme } from "@mui/material/styles"
import LandingLayout from "../layouts/LandingLayout"
import BookADemoSection from "../components/views/landing/BookADemoSection"
import TestimonialsSection from "../components/views/landing/TestimonialsSection"
import UniversitySection from "../components/views/landing/UniversitySection"
import BenefitsSection from "../components/views/landing/BenefitsSection"
import CompaniesSection from "../components/views/landing/CompaniesSection"
import HeroSection from "../components/views/landing/HeroSection"
import ScrollToTop from "../components/views/common/ScrollToTop"
import {
   alternateBackground,
   landingBottomBackground,
   livestream,
   mouse,
   promote,
   star,
   trackAnalytics,
   wallet,
} from "../constants/images"
import ExperienceSection from "components/views/landing/ExperienceSection"

const CareerCenterLandingPage = ({}) => {
   const {
      palette: { secondary, common, grey },
   } = useTheme()

   const careerCenterBenefitsData = [
      {
         name: "Open new doors for your students",
         description:
            "Enable companies on CareerFairy " +
            "to book live streams with you to " +
            "engage with your student " +
            "community",
         imageUrl: star,
      },
      {
         name: "Forget the hassle",
         description:
            "Set up and manage your live " +
            "streams in a few clicks. No room to " +
            "book, no complex logistics to " +
            "deal with.",
         imageUrl: mouse,
      },
      {
         name: "Generate additional revenue",
         description:
            "Don't compromise your current " +
            "offering. Set the price of the live streams " +
            "yourself and organize the number " +
            "of events that you want to offer ",
         imageUrl: wallet,
      },
      {
         name: "Get feedback from your students",
         description:
            "CareerFairy provides detailed analytics " +
            "to help you understand what your students " +
            "are looking for",
         imageUrl: trackAnalytics,
      },
   ]

   const careerCenterBenefitsData2 = [
      {
         name: "Plan a live stream",
         description:
            "Manage your liv estream requests " +
            "from companies and setup future " +
            "events",
         imageUrl: livestream,
      },
      {
         name: "Promote the event",
         description:
            "Once a live stream event is scheduled, " +
            "you notify your students about the event ",
         imageUrl: promote,
      },
      {
         name: "Track analytics",
         description:
            "Access relevant audience data in " +
            "real-time and provide feedback to " +
            "your corporate partners",
         imageUrl: trackAnalytics,
      },
   ]

   return (
      <LandingLayout
         topImage={alternateBackground}
         bottomImage={landingBottomBackground}
      >
         <HeroSection
            title={
               <div>
                  <b>Boost</b> student & employer interactions with our{" "}
                  <b>career live streams</b>
               </div>
            }
            big
         />
         <BenefitsSection
            title={"Why join CareerFairy?"}
            benefits={careerCenterBenefitsData}
         />
         <UniversitySection
            subtitle=""
            title="Some of the universities we work with"
         />
         <ExperienceSection />
         <BenefitsSection
            title={"Simple setup"}
            benefits={careerCenterBenefitsData2}
         />
         <CompaniesSection overheadText="Access our network of 200+ employers" />
         <TestimonialsSection
            title="What Companies Are Saying"
            backgroundColor={grey["200"]}
         />
         <BookADemoSection
            backgroundColor={`linear-gradient(-8deg, ${secondary.main} 1%, ${secondary.light} 100%)`}
            color={common.white}
            big
            bookingWhite
            title={"Have a chat with us"}
         />
         <ScrollToTop />
      </LandingLayout>
   )
}

export default CareerCenterLandingPage
