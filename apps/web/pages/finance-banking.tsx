import React from "react"
import { NextPage } from "next"
import Head from "next/head"
import { Box } from "@mui/material"
import HeroSectionFinanceBanking from "../components/views/landing/HeroSection/HeroSectionFinanceBanking"
import CompaniesSectionFinanceBanking from "../components/views/landing/CompaniesSection/CompaniesSectionFinanceBanking"
import TestimonialsSectionFinanceBanking from "../components/views/landing/TestimonialsSection/TestimonialsSectionFinanceBanking"
import BenefitsSectionFinanceBanking from "../components/views/landing/BenefitsSection/BenefitsSectionFinanceBanking"
import BookADemoSection from "../components/views/landing/BookADemoSection"
import { sxStyles } from "../types/commonTypes"

const styles = sxStyles({
   pageContainer: {
      minHeight: "100vh",
      backgroundColor: theme => theme.palette.background.default,
   },
})

const FinanceBankingLandingPage: NextPage = () => {
   return (
      <>
         <Head>
            <title>Finance & Banking Recruitment Solutions | CareerFairy</title>
            <meta 
               name="description" 
               content="Recruit top finance professionals with CareerFairy's specialized platform. Access leading finance and banking talent through exclusive career events and industry insights sessions." 
            />
            <meta name="keywords" content="finance recruitment, banking careers, financial services talent, investment banking jobs, finance professionals" />
            <meta property="og:title" content="Finance & Banking Recruitment Solutions | CareerFairy" />
            <meta 
               property="og:description" 
               content="Recruit top finance professionals with CareerFairy's specialized platform." 
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.careerfairy.io/finance-banking" />
            <link rel="canonical" href="https://www.careerfairy.io/finance-banking" />
         </Head>
         
         <Box sx={styles.pageContainer}>
            <HeroSectionFinanceBanking />
            
            <CompaniesSectionFinanceBanking 
               backgroundColor="background.paper"
               color="text.primary"
            />
            
            <BenefitsSectionFinanceBanking 
               backgroundColor="neutral.50"
            />
            
            <TestimonialsSectionFinanceBanking 
               backgroundColor="background.default"
               sliderArrowColor="tertiary"
            />
            
            <BookADemoSection 
               backgroundColor="tertiary.main"
               color="tertiary.contrastText"
               title="Ready to Elevate Your Finance Recruitment?"
               subtitle="Book a demo to see how CareerFairy can help you connect with premier financial professionals"
            />
         </Box>
      </>
   )
}

export default FinanceBankingLandingPage