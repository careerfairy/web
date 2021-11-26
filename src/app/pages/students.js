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
import { useAuth } from "../HOCs/AuthProvider";
import GroupJoinModal from "../components/views/profile/GroupJoinModal";

const StudentLandingPage = ({}) => {
   const {
      palette: { secondary, common },
   } = useTheme();

   const { userData } = useAuth();
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined);
   const handleCloseJoinModal = () => setJoinGroupModalData(undefined);
   const handleOpenJoinModal = (groupData) => setJoinGroupModalData(groupData);
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
         buttonProps: !userData && {
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
         amount: "700+",
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
            <UpcomingLivestreamsSection
               handleOpenJoinModal={handleOpenJoinModal}
            />
            {/*<FollowCompaniesSection*/}
            {/*   handleOpenJoinModal={handleOpenJoinModal}*/}
            {/*   title={"Follow Your Favorite Companies"}*/}
            {/*/>*/}
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
               goToNextLivestreams
               handleOpenCalendly={handleOpenCalendly}
               title={"Register for your first event today"}
               dividerColor={secondary.light}
            />
            <CalendlyModal
               open={calendlyModalOpen}
               onClose={handleCloseCalendly}
            />
            <ScrollToTop />
            <GroupJoinModal
               open={Boolean(joinGroupModalData)}
               group={joinGroupModalData}
               userData={userData}
               closeModal={handleCloseJoinModal}
            />
         </LandingLayout>
      </React.Fragment>
   );
};

export default StudentLandingPage;
