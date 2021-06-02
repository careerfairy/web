import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { openPopupWidget } from "react-calendly";
import LandingLayout from "../layouts/LandingLayout";
import BookADemoSection from "../components/views/landing/BookADemoSection";
import TestimonialsSection from "../components/views/landing/TestimonialsSection";
import AnalyticsSection from "../components/views/landing/AnalyticsSection";
import StreamSection from "../components/views/landing/StreamSection";
import UniversitySection from "../components/views/landing/UniversitySection";
import BenefitsSection from "../components/views/landing/BenefitsSection";
import CompaniesSection from "../components/views/landing/CompaniesSection";
import HeroSection from "../components/views/landing/HeroSection";

const LandingPage = ({}) => {
   const {
      palette: { secondary, common, grey,background, primary , text},
   } = useTheme();

   const handleOpenCalendly = () => {
      const styles = {
         height: "100px",
      };
      const pageSettings = {
        backgroundColor: background.default,
        hideEventTypeDetails: false,
        hideLandingPageDetails: false,
        primaryColor: primary.main,
        textColor: text.primary
      }

      const prefill = {
        // email: 'test@test.com',
        // firstName: 'Jon',
        // lastName: 'Snow',
        // name: 'Jon Snow',
        // guests: [
        //   'janedoe@example.com',
        //   'johndoe@example.com'
        // ],
        // customAnswers: {
        //   a1: 'a1',
        //   a2: 'a2',
        //   a3: 'a3',
        //   a4: 'a4',
        //   a5: 'a5',
        //   a6: 'a6',
        //   a7: 'a7',
        //   a8: 'a8',
        //   a9: 'a9',
        //   a10: 'a10'
        // }
      }
      const utm = {
        utmCampaign: 'Spring Sale 2019',
        utmContent: 'Shoe and Shirts',
        utmMedium: 'Ad',
        utmSource: 'Facebook',
        utmTerm: 'Spring'
      }

     openPopupWidget({ url, prefill, pageSettings, utm })
   };

   return (
      <LandingLayout>
         <HeroSection
           handleOpenCalendly={handleOpenCalendly}
         />
         <CompaniesSection big />
         <BenefitsSection title={"Key Benefits"} />
         <UniversitySection
            subtitle="The best talent is evenly distributed, which makes it
            hard to reach. With CareerFairy live streams, 
            you can reach students at multiple top universities in a 
            single one hour-long event. No travel, no logistics, no days off work."
            title="Reach your target universities with a single event"
         />
         <StreamSection
            title={
               <>
                  Showcase your best ambassadors <b>- your employees.</b>
               </>
            }
            subtitle="We believe that your employees are your biggest asset, and their insights provide
                an authentic look into the opportunities that your company has to offer. Their passion is what
                will attract tomorrow's best hires"
         />
         <AnalyticsSection
            title={
               <>
                  Measure your success with <b>concrete data</b>
               </>
            }
            subtitle="Track registrations, participants, feedback
                 and your talent pool throughout the lifecycle of your stream"
         />
         <TestimonialsSection
            title="What They Are Saying"
            backgroundColor={grey["200"]}
         />
         <BookADemoSection
            backgroundColor={`linear-gradient(-8deg, ${secondary.main} 1%, ${secondary.light} 100%)`}
            color={common.white}
            big
            handleOpenCalendly={handleOpenCalendly}
            title={"Interesting?"}
         />
      </LandingLayout>
   );
};

export default LandingPage;
