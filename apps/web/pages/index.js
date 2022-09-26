import React, { useState } from "react"
import { useTheme } from "@mui/material/styles"
import LandingLayout from "../layouts/LandingLayout"
import BookADemoSection from "../components/views/landing/BookADemoSection"
import CompaniesSection from "../components/views/landing/CompaniesSection"
import CalendlyModal from "../components/views/landing/CalendlyModal"
import ScrollToTop from "../components/views/common/ScrollToTop"
import {
   alternateStudentBackground,
   landingBottomBackground,
   lightBulbShape,
   locationShape,
   suitCaseShape,
} from "../constants/images"
import HeadWithMeta from "../components/page/HeadWithMeta"
import StudentHeroSection from "../components/views/landing/HeroSection/StudentHeroSection"
import UpcomingLivestreamsSection from "../components/views/landing/UpcomingLivestreamsSection"
import FollowCompaniesSection from "../components/views/landing/FollowCompaniesSection"
import StudentBenefitsSection from "../components/views/landing/StudentBenefitsSection"
import Link from "materialUI/NextNavLink"
import NumbersSection from "../components/views/landing/NumbersSection"
import { useAuth } from "../HOCs/AuthProvider"
import SpeakersSection from "../components/views/landing/SpeakersSection"
import RegistrationModal from "../components/views/common/registration-modal"
import nookies from "nookies"

const StudentLandingPage = ({}) => {
   const {
      palette: { secondary, common },
   } = useTheme()

   const { userData } = useAuth()
   const [joinGroupModalData, setJoinGroupModalData] = useState(undefined)
   const handleCloseJoinModal = () => setJoinGroupModalData(undefined)
   const handleOpenJoinModal = ({ groups }) => setJoinGroupModalData({ groups })
   const [calendlyModalOpen, setCalendlyModalOpen] = useState(false)

   const handleOpenCalendly = () => {
      setCalendlyModalOpen(true)
   }

   const handleCloseCalendly = () => setCalendlyModalOpen(false)

   const studentBenefitsData = [
      {
         name: "Get inspired",
         description:
            "Discover who's hiring and meet people in different workplaces",
         imageUrl: lightBulbShape, // personShape might give better context
         buttonProps: !userData && {
            children: "Discover",
            href: "/next-livestreams",
            component: Link,
         },
      },
      {
         name: "Land your dream job",
         description:
            "Connect with recruiters that will give you valuable tips & tricks to stand out",
         imageUrl: suitCaseShape,
      },
      {
         name: "Connect from anywhere",
         description:
            "Connect via your laptop or phone - anytime, from anywhere",
         imageUrl: locationShape,
      },
   ]

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
         amount: "230+",
         label: "Universities",
      },
   ]

   const speakers = [
      {
         avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2F23581989-66fc-4de8-8a73-75d9614df8f7_Theresa_Wang.jpg?alt=media",
         position: "Project Leader",
         name: "Theresa",
         companyName: "Consultant",
         companyUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2F997c48b1-8b5d-4670-b2c7-b59d52563a24_BCG_LOCKUP_CMYK_BLACK.png?alt=media",
      },
      {
         avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fe03205ff-516b-4ddb-bb33-a39517ac1def__Mauer.png?alt=media",
         position: "CEO of Aisight und KI-Experte",
         name: "Matthias",
         companyUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2F01ce5c5c-8e72-44de-a3ac-bf5c31542f26_logo.jpg?alt=media",
      },
      {
         avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fe67a2e65-8ac9-4ab6-92f0-bfd8b706af12_IA.jpg?alt=media",
         position:
            "Analyst, Structured & Solutions Global Market Sales Switzerland",
         name: "Ines",
         companyName: "UBS",
         companyUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Ff0967998-3ef3-4942-be6e-b9ddd11c06aa_b_2018.jpg?alt=media",
      },
      {
         avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fdeb6bccd-3463-4107-86c9-babb90be0c29_anager.jpg?alt=media",
         position: "Senior Innovation Manager",
         name: "Dirk",
         companyName: "NIVEA",
         companyUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fnivea-logo.png?alt=media&token=c8b982c6-4a9d-4bad-bbd9-607e0d2f213d",
      },
      {
         avatarUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2F8f75bb7f-c6ae-4cea-b531-d9c8986b2de9_la_009.jpg?alt=media",
         position: "Campus Recruiter",
         name: "Manuela",
         companyName: "KPMG",
         companyUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2F68d9a71d-cacd-46da-ac03-deabc74c7e77_ne__1_.jpg?alt=media",
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
            topImage={alternateStudentBackground}
         >
            <StudentHeroSection big />
            <CompaniesSection
               title={"250+ companies and startups are waiting for you."}
            />
            <SpeakersSection
               speakers={speakers}
               title={"Meet your future colleagues."}
               subtitle={"Recent speakers that you might have missed"}
            />
            <UpcomingLivestreamsSection
               title={"Next events"}
               handleOpenJoinModal={handleOpenJoinModal}
            />
            <FollowCompaniesSection
               title={
                  "See your favourite companies missing? Let's change that."
               }
            />
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
               goTo={userData ? "/next-livestreams" : "/signup"}
               handleOpenCalendly={handleOpenCalendly}
               title={
                  userData
                     ? "Register for your first event today"
                     : "Start finding your dream job today!"
               }
               dividerColor={secondary.light}
            />
            <CalendlyModal
               open={calendlyModalOpen}
               onClose={handleCloseCalendly}
            />
            <ScrollToTop />
            <RegistrationModal
               open={Boolean(joinGroupModalData)}
               handleClose={handleCloseJoinModal}
               livestream={joinGroupModalData?.livestream}
               groups={joinGroupModalData?.groups}
            />
         </LandingLayout>
      </React.Fragment>
   )
}

export const getServerSideProps = async (ctx) => {
   try {
      const cookies = nookies.get(ctx)

      // const token = await firebaseAdmin.auth().verifyIdToken(cookies.token);
      //
      // // the user is authenticated!
      // const { uid, email } = token;

      // FETCH STUFF HERE!! 🚀

      const firebaseToken = cookies.token

      if (firebaseToken) {
         return {
            redirect: {
               destination: "/portal",
               permanent: false,
            },
         }
      }

      return { props: {} }
   } catch (err) {
      return { props: {} }
   }
}

export default StudentLandingPage
