import { useTheme } from "@mui/styles"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import NotFoundView from "components/views/livestream-dialog/views/common/NotFoundView"
import {
   TAB_VALUES,
   TalentProfileView,
} from "layouts/UserLayout/TalentProfile/TalentProfileView"
import { useRouter } from "next/router"
import SEO from "../../components/util/SEO"
import UserLayout from "../../layouts/UserLayout"

const CompaniesPage = () => {
   const theme = useTheme()
   const { pathname } = useRouter()
   const { talentProfileV1 } = useFeatureFlags()

   if (!talentProfileV1)
      return (
         <NotFoundView
            title="Page not found"
            description="The page you are trying to navigate to was not found"
         />
      )

   return (
      <UserLayout backgroundColor={theme.brand.white[300]}>
         <SEO
            title="CareerFairy | My Profile"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         <TalentProfileView currentPath={TAB_VALUES.company.value} />
      </UserLayout>
   )
}

export default CompaniesPage
