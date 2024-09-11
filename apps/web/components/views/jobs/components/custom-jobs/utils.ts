import { CustomJobsPresenter } from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { GetServerSidePropsContext, GetStaticPropsContext } from "next"
import { errorLogAndNotify } from "util/CommonUtil"
import { getServerSideCustomJob } from "util/serverUtil"
import { CustomJobDialogData } from "./CustomJobDialogLayout"

export const getCustomJobDialogData = async (
   ctx: GetServerSidePropsContext | GetStaticPropsContext
): Promise<CustomJobDialogData> => {
   try {
      const customJobParams = (ctx.params.livestreamDialog as string[]) || []

      if (customJobParams[0] === "jobs" && customJobParams[1]) {
         const customJob = await getServerSideCustomJob(customJobParams[1])

         return {
            serverSideCustomJob: customJob
               ? CustomJobsPresenter.serializeDocument(customJob)
               : null,
         }
      }
   } catch (e) {
      errorLogAndNotify(e, {
         message: "Error getting custom job dialog data",
         context: "getCustomJobDialogData",
         extra: {
            ctx,
         },
      })
   }
   return null
}
