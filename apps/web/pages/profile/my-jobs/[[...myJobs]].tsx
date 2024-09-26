import { CustomJobApplicationSourceTypes } from "@careerfairy/shared-lib/customJobs/customJobs"
import { CustomJobDialogLayout } from "components/views/jobs/components/custom-jobs/CustomJobDialogLayout"
import { getCustomJobDialogData } from "components/views/jobs/components/custom-jobs/utils"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { useRouter } from "next/router"
import SEO from "../../../components/util/SEO"
import UserLayout from "../../../layouts/UserLayout"
import UserView from "../../../layouts/UserLayout/UserView"

export const DIALOG_SOURCE = "myJobs"

const CustomJobsPage = ({
   customJobDialogData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
   const { pathname } = useRouter()

   return (
      <UserLayout>
         <CustomJobDialogLayout
            customJobDialogData={customJobDialogData}
            source={{
               source: CustomJobApplicationSourceTypes.Profile,
               id: CustomJobApplicationSourceTypes.Profile,
            }}
            dialogSource={DIALOG_SOURCE}
         >
            <SEO
               title="CareerFairy | Jobs"
               canonical={`https://www.careerfairy.io${pathname}`}
            />
            <UserView currentPath="/profile/my-jobs" />
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
export default CustomJobsPage
