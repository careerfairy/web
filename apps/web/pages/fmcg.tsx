import React from "react"
import { NextPage } from "next"
import Head from "next/head"
import { Box } from "@mui/material"
import HeroSectionFMCG from "../components/views/landing/HeroSection/HeroSectionFMCG"
import CompaniesSectionFMCG from "../components/views/landing/CompaniesSection/CompaniesSectionFMCG"
import TestimonialsSectionFMCG from "../components/views/landing/TestimonialsSection/TestimonialsSectionFMCG"
import BenefitsSectionFMCG from "../components/views/landing/BenefitsSection/BenefitsSectionFMCG"
import BookADemoSection from "../components/views/landing/BookADemoSection"
import { sxStyles } from "../types/commonTypes"

const styles = sxStyles({
   pageContainer: {
      minHeight: "100vh",
      backgroundColor: theme => theme.palette.background.default,
   },
})

const FMCGLandingPage: NextPage = () => {
   return (
      <>
         <Head>
            <title>FMCG Recruitment Solutions | CareerFairy</title>
            <meta 
               name="description" 
               content="Connect with top FMCG talent through CareerFairy's innovative recruitment platform. Access leading consumer goods professionals through live career events and networking opportunities." 
            />
            <meta name="keywords" content="FMCG recruitment, consumer goods careers, talent acquisition, fast moving consumer goods jobs" />
            <meta property="og:title" content="FMCG Recruitment Solutions | CareerFairy" />
            <meta 
               property="og:description" 
               content="Connect with top FMCG talent through CareerFairy's innovative recruitment platform." 
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.careerfairy.io/fmcg" />
            <link rel="canonical" href="https://www.careerfairy.io/fmcg" />
         </Head>
         
         <Box sx={styles.pageContainer}>
            <HeroSectionFMCG />
            
            <CompaniesSectionFMCG 
               backgroundColor="background.paper"
               color="text.primary"
            />
            
            <BenefitsSectionFMCG 
               backgroundColor="neutral.50"
            />
            
            <TestimonialsSectionFMCG 
               backgroundColor="background.default"
               sliderArrowColor="primary"
            />
            
            <BookADemoSection 
               backgroundColor="primary.main"
               color="primary.contrastText"
               title="Ready to Transform Your FMCG Recruitment?"
               subtitle="Book a demo to see how CareerFairy can help you connect with top consumer goods professionals"
            />
         </Box>
      </>
   )
}

export default FMCGLandingPage