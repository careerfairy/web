import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useTheme } from "@mui/styles"
import { CustomJobDialogLayout } from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { getCustomJobDialogData } from "components/views/jobs/components/custom-jobs/utils"
import { TalentProfileView } from "layouts/UserLayout/TalentProfile/TalentProfileView"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { useRouter } from "next/router"
import SEO from "../../../components/util/SEO"
import UserLayout from "../../../layouts/UserLayout"

export const DIALOG_SOURCE = "jobs"

const JobsPage = ({
   customJobDialogData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const theme = useTheme()
   const { pathname } = useRouter()

   return (
      <UserLayout backgroundColor={theme.brand.white[300]}>
         <CustomJobDialogLayout
            customJobDialogData={customJobDialogData}
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
            <TalentProfileView currentPath="/profile/jobs" />
         </CustomJobDialogLayout>
      </UserLayout>
   )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   const customJobDialogData = await getCustomJobDialogData(ctx, DIALOG_SOURCE)

   return {
      props: {
         customJobDialogData,
      },
   }
}
export default JobsPage
