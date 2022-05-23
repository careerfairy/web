import React from "react"
import { useTheme } from "@mui/material/styles"
import GeneralLayout from "../../layouts/GeneralLayout"
import SupportHeroSection from "../../components/views/support/SupportHeroSection"
import SupportCategoriesSection from "../../components/views/support/SupportCategoriesSection"

const supportBanner =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/support-illustrations%2Fsupport-banner.svg?alt=media&token=23ca911c-9151-4831-9eb1-c13f1ed6fe20"

const SupportPage = ({}) => {
   const {
      palette: {
         common: { white },
         text: { primary },
         navyBlue,
      },
   } = useTheme()
   return (
      <GeneralLayout>
         <SupportHeroSection
            color={white}
            backgroundColor={navyBlue.main}
            backgroundImage={supportBanner}
            backgroundImageOpacity={0.5}
            hasSearch
            title="CareerFairy Help Center"
            subtitle=""
         />
         <SupportCategoriesSection
            color={primary}
            backgroundColor=""
            backgroundImage=""
            backgroundImageOpacity={1}
            title="Help Desk"
            subtitle=""
         />
      </GeneralLayout>
   )
}

export async function getServerSideProps() {
   return {
      notFound: true,
   }
}

export default SupportPage
