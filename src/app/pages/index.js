import React, { useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import LandingLayout from "../layouts/LandingLayout";
import BookADemoSection from "../components/views/landing/BookADemoSection";
import TestimonialsSection from "../components/views/landing/TestimonialsSection";
import AnalyticsSection from "../components/views/landing/AnalyticsSection";
import StreamSection from "../components/views/landing/StreamSection";
import UniversitySection from "../components/views/landing/UniversitySection";
import BenefitsSection from "../components/views/landing/BenefitsSection";
import CompaniesSection from "../components/views/landing/CompaniesSection";
import HeroSection from "../components/views/landing/HeroSection";
import CalendlyModal from "../components/views/landing/CalendlyModal";
import ScrollToTop from "../components/views/common/ScrollToTop";

const LandingPage = ({}) => {
   const {
      palette: { secondary, common, grey },
   } = useTheme();

   const [calendlyModalOpen, setCalendlyModalOpen] = useState(false);

   const handleOpenCalendly = () => {
      setCalendlyModalOpen(true);
   };

   const handleCloseCalendly = () => setCalendlyModalOpen(false);

   return (
      <LandingLayout>
         <HeroSection handleOpenCalendly={handleOpenCalendly} />
         <CompaniesSection big />
         <BenefitsSection title={"Why CareerFairy?"} />
         <UniversitySection
            subtitle="The best talent is evenly distributed, which makes it
            hard to reach. With CareerFairy live streams,
            you can reach students at multiple top universities in a
            single one hour-long event. No travel, no logistics, no days off work."
            title="Some universities that we work with"
         />
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
                 Boost your <b>employer brand</b>, measure the results with <b>data</b>
               </>
            }
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
            handleOpenCalendly={handleOpenCalendly}
            title={"Join the ranks of leading organisations today"}
         />
         <CalendlyModal
            open={calendlyModalOpen}
            onClose={handleCloseCalendly}
         />
        <ScrollToTop/>
      </LandingLayout>
   );
};

export default LandingPage;
