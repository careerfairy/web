import React, { useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import LandingLayout from "../layouts/LandingLayout";
import BookADemoSection from "../components/views/landing/BookADemoSection";
import CompaniesSection from "../components/views/landing/CompaniesSection";
import CalendlyModal from "../components/views/landing/CalendlyModal";
import ScrollToTop from "../components/views/common/ScrollToTop";
import {
   alternateStudentBackground,
   landingBottomBackground,
   locationShape,
   personShape,
   suitCaseShape,
} from "../constants/images";
import HeadWithMeta from "../components/page/HeadWithMeta";
import StudentHeroSection from "../components/views/landing/HeroSection/StudentHeroSection";
import UpcomingLivestreamsSection from "../components/views/landing/UpcomingLivestreamsSection";
import FollowCompaniesSection from "../components/views/landing/FollowCompaniesSection";
import StudentBenefitsSection from "../components/views/landing/StudentBenefitsSection";
import Link from "materialUI/NextNavLink";
import NumbersSection from "../components/views/landing/NumbersSection";

const StudentLandingPage = ({}) => {
   const {
      palette: { secondary, common, grey },
   } = useTheme();

   const [calendlyModalOpen, setCalendlyModalOpen] = useState(false);

   const handleOpenCalendly = () => {
      setCalendlyModalOpen(true);
   };

   const handleCloseCalendly = () => setCalendlyModalOpen(false);

   const studentBenefitsData = [
      {
         name: "Students",
         description: "Register & meet companies at livestreams now",
         imageUrl: personShape,
         buttonProps: {
            children: "Register",
            href: "/signup",
            component: Link,
         },
      },
      {
         name: "Companies",
         description: "Engage and recruit talents from leading schools",
         imageUrl: suitCaseShape,
         buttonProps: {
            children: "Book a demo",
            onClick: handleOpenCalendly,
         },
      },
      {
         name: "Career Centers",
         description:
            "Boost student & employer interactions with our career live streams",
         imageUrl: locationShape,
         buttonProps: {
            children: "Book a demo",
            onClick: handleOpenCalendly,
         },
      },
   ];

   const numbersData = [
      {
         id: 1,
         amount: "250+",
         label: "Companies",
      },
      {
         id: 2,
         amount: "200+",
         label: "Live Streaming Events",
      },
      {
         id: 3,
         amount: "60+",
         label: "Universities",
      },
   ];

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
            topImage={alternateStudentBackground}
         >
            <StudentHeroSection big />
            <CompaniesSection />
            <UpcomingLivestreamsSection big />
            <FollowCompaniesSection title={"Follow Your Favorite Companies"} />
            <StudentBenefitsSection
               title={
                  <>
                     Connecting <b>students</b> and <b>companies</b> in a
                     meaningful way.
                  </>
               }
               benefits={studentBenefitsData}
            />
            <NumbersSection numbersData={numbersData} />
            <BookADemoSection
               backgroundColor={`transparent`}
               color={common.black}
               big
               signUp
               handleOpenCalendly={handleOpenCalendly}
               title={"Join the ranks of leading organisations today"}
               dividerColor={secondary.light}
            />
            <CalendlyModal
               open={calendlyModalOpen}
               onClose={handleCloseCalendly}
            />
            <ScrollToTop />
         </LandingLayout>
      </React.Fragment>
   );
};

export default StudentLandingPage;
