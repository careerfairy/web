import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useTheme } from "@mui/styles"
import { CustomJobDialogLayout } from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { TalentProfileView } from "layouts/UserLayout/TalentProfile/TalentProfileView"
import { useRouter } from "next/router"
import SEO from "../../../components/util/SEO"
import UserLayout from "../../../layouts/UserLayout"

export const DIALOG_SOURCE = "jobs"

const JobsPage = () => {
   const theme = useTheme()
   const { pathname } = useRouter()

   return (
      <UserLayout backgroundColor={theme.brand.white[300]}>
         <CustomJobDialogLayout
            source={{
               source: CustomJobApplicationSourceTypes.Profile,
               id: CustomJobApplicationSourceTypes.Profile,
            }}
            dialogSource={DIALOG_SOURCE}
            hideApplicationConfirmation
         >
            <SEO
               title="CareerFairy | Jobs"
               canonical={`https://www.careerfairy.io${pathname}`}
            />
            <TalentProfileView currentPath="/profile/career" />
         </CustomJobDialogLayout>
      </UserLayout>
   )
}

export default JobsPage
