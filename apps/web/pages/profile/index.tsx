import { useTheme } from "@mui/styles"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { TalentProfileView } from "layouts/UserLayout/TalentProfile/TalentProfileView"
import { TAB_VALUES } from "layouts/UserLayout/TalentProfile/constants"
import { useRouter } from "next/router"
import SEO from "../../components/util/SEO"
import UserLayout from "../../layouts/UserLayout"
import UserView from "../../layouts/UserLayout/UserView"

const UserProfile = () => {
   const theme = useTheme()
   const { pathname } = useRouter()
   const { talentProfileV1 } = useFeatureFlags()

   return (
      <UserLayout
         backgroundColor={talentProfileV1 ? theme.brand.white[300] : undefined}
      >
         <SEO
            title="CareerFairy | My Profile"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         {talentProfileV1 ? (
            <TalentProfileView currentPath={TAB_VALUES.profile.value} />
         ) : (
            <UserView currentPath="/profile" />
         )}
      </UserLayout>
   )
}

export default UserProfile
