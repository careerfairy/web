import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import TalentProfileView from "layouts/UserLayout/TalentProfile/TalentProfileView"
import { useRouter } from "next/router"
import SEO from "../../components/util/SEO"
import UserLayout from "../../layouts/UserLayout"
import UserView from "../../layouts/UserLayout/UserView"

const UserProfile = () => {
   const { pathname } = useRouter()
   const { talentProfileV1 } = useFeatureFlags()
   return (
      <UserLayout backgroundColor="#FAFAFE">
         <SEO
            title="CareerFairy | My Profile"
            canonical={`https://www.careerfairy.io${pathname}`}
         />
         {talentProfileV1 ? (
            <TalentProfileView />
         ) : (
            <UserView currentPath="/profile" />
         )}
      </UserLayout>
   )
}

export default UserProfile
