import React from "react"
import { NextPage } from "next"
import Head from "next/head"
import { Box } from "@mui/material"
import HeroSectionEngineering from "../components/views/landing/HeroSection/HeroSectionEngineering"
import CompaniesSectionEngineering from "../components/views/landing/CompaniesSection/CompaniesSectionEngineering"
import TestimonialsSectionEngineering from "../components/views/landing/TestimonialsSection/TestimonialsSectionEngineering"
import BenefitsSectionEngineering from "../components/views/landing/BenefitsSection/BenefitsSectionEngineering"
import BookADemoSection from "../components/views/landing/BookADemoSection"
import { sxStyles } from "../types/commonTypes"

const styles = sxStyles({
   pageContainer: {
      minHeight: "100vh",
      backgroundColor: theme => theme.palette.background.default,
   },
})

const EngineeringLandingPage: NextPage = () => {
   return (
      <>
         <Head>
            <title>Engineering Recruitment Solutions | CareerFairy</title>
            <meta 
               name="description" 
               content="Build your engineering team with CareerFairy's specialized recruitment platform. Connect with skilled engineers and manufacturing professionals through targeted career events and technical workshops." 
            />
            <meta name="keywords" content="engineering recruitment, manufacturing careers, technical talent acquisition, engineering jobs, industrial recruitment" />
            <meta property="og:title" content="Engineering Recruitment Solutions | CareerFairy" />
            <meta 
               property="og:description" 
               content="Build your engineering team with CareerFairy's specialized recruitment platform." 
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.careerfairy.io/engineering" />
            <link rel="canonical" href="https://www.careerfairy.io/engineering" />
         </Head>
         
         <Box sx={styles.pageContainer}>
            <HeroSectionEngineering 
               big={true}
               backgroundColor="secondary.50"
            />
            
            <CompaniesSectionEngineering 
               backgroundColor="background.paper"
               color="text.primary"
            />
            
            <BenefitsSectionEngineering 
               backgroundColor="neutral.50"
            />
            
            <TestimonialsSectionEngineering 
               backgroundColor="background.default"
               sliderArrowColor="secondary"
            />
            
            <BookADemoSection 
               backgroundColor="secondary.main"
               color="secondary.contrastText"
               title="Ready to Build Your Engineering Dream Team?"
               subtitle="Book a demo to see how CareerFairy can help you connect with top engineering professionals"
            />
         </Box>
      </>
   )
}

export default EngineeringLandingPage