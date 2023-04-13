import React from "react"
import { useTheme } from "@mui/material/styles"
import LandingLayout from "../../layouts/LandingLayout"
import BookADemoSection from "../../components/views/landing/BookADemoSection"
import TestimonialsSection from "../../components/views/landing/TestimonialsSection"
import AnalyticsSection from "../../components/views/landing/AnalyticsSection"
import StreamSection from "../../components/views/landing/StreamSection"
import UniversitySection from "../../components/views/landing/UniversitySection"
import BenefitsSection from "../../components/views/landing/BenefitsSection"
import CompaniesSection from "../../components/views/landing/CompaniesSection"
import HeroSection from "../../components/views/landing/HeroSection"
import ScrollToTop from "../../components/views/common/ScrollToTop"
import {
   engageShape,
   landingBottomBackground,
   mainBackground,
   measureShape,
   reachShape,
   rectangle1,
} from "../../constants/images"
import HeadWithMeta from "../../components/page/HeadWithMeta"

const CompanyLandingPage = () => {
   const {
      palette: { secondary, common, grey },
   } = useTheme()

   const companyBenefitsData = [
      {
         name: "Create fun career events",
         description:
            "A highly interactive format " +
            "developed for a young " +
            "audience worldwide",
         imageUrl: engageShape,
      },
      {
         name: "Reach more talents",
         description:
            "We promote your events to " +
            "the CareerFairy community " +
            "and universities",
         imageUrl: reachShape,
      },
      {
         name: "Easily measure success",
         description:
            "Demonstrate the success of " +
            "your events through " +
            "detailed analytics",
         imageUrl: measureShape,
      },
   ]

   return (
      <React.Fragment>
         <HeadWithMeta
            title={`CareerFairy | Watch live streams. Get hired.`}
            fullPath={`https://careerfairy.io/`}
            image={"https://careerfairy.io/logo_padding_teal.png"}
            description={""}
         />
         <LandingLayout
            bottomImage={landingBottomBackground}
            topImage={mainBackground}
         >
            <HeroSection big />
            <CompaniesSection overheadText="Over 200+ happy customers" />
            <BenefitsSection
               title={"Why CareerFairy?"}
               benefits={companyBenefitsData}
            />
            <UniversitySection
               title={"Some of the universities we work with"}
               subtitle="Reach students at multiple universities with a single event. No travel, no logistics, no days off work."
            />
            {/*<iframe frameBorder="0" height="600" src="https://personal-habib.web.app/next-livestreams/GXW3MtpTehSmAe0aP1J4/embed" title="Events"/>*/}
            <StreamSection
               title={
                  <>
                     Showcase your best ambassadors <b>- your employees.</b>
                  </>
               }
               subtitle="We believe that your employees are your biggest asset, and their insights provide
                an authentic look into the opportunities that your company has to offer."
            />
            <AnalyticsSection
               title={
                  <>
                     Boost your <b>employer brand</b>, measure the results with{" "}
                     <b>data</b>
                  </>
               }
               backgroundImage={rectangle1}
               subtitle="Evaluate the success of your events, gather live feedback from your audience and follow up easily with interesting candidates"
            />
            <TestimonialsSection
               title="What They Are Saying"
               backgroundColor={grey["200"]}
            />
            <BookADemoSection
               backgroundColor={`linear-gradient(-8deg, ${secondary.main} 1%, ${secondary.light} 100%)`}
               color={common.white}
               big
               bookingWhite
               title={"Join the ranks of leading organisations today"}
            />
            <ScrollToTop />
         </LandingLayout>
      </React.Fragment>
   )
}

export default CompanyLandingPage
