import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import LandingLayout from "../layouts/LandingLayout";
import BookADemoSection from "../components/views/landing/BookADemoSection";
import TestimonialsSection from "../components/views/landing/TestimonialsSection";
import AnalyticsSection from "../components/views/landing/AnalyticsSection";
import StreamSection from "../components/views/landing/StreamSection";
import UniversitySection from "../components/views/landing/UniversitySection";
import BenefitsSection from "../components/views/landing/BenefitsSection";

const useStyles = makeStyles((theme) => ({

}));

const LandingPage = ({}) => {
   const {
      palette: { secondary, common, grey },
   } = useTheme();

   return (
      <LandingLayout>
         <BenefitsSection
            title={
             "Key Benefits"
            }
         />
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
            title={"Interesting?"}
         />
      </LandingLayout>
   );
};

export default LandingPage;
