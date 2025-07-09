import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useAuth } from "HOCs/AuthProvider"
import useSWRMutation from "swr/mutation"

import { useRouter } from "next/router"
import { useCallback } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { dataLayerCustomJobEvent } from "util/analyticsUtils"
import { customJobRepo } from "../../../data/RepositoryInstances"
import useSnackbarNotifications from "../useSnackbarNotifications"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

export const useSavedJob = (customJob: CustomJob) => {
   const { userData, isLoggedOut } = useAuth()
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { push, asPath } = useRouter()

   const { data, status } = useFirestoreDocument<CustomJob>(
      "userData",
      [userData?.id, "savedJobs", customJob.id],
      {
         idField: "id",
         initialData: customJob,
      }
   )
   const isSaved = !!data && status === "success"

   const redirectToSignUp = useCallback(() => {
      return push({
         pathname: "/signup",
         query: { absolutePath: asPath, savedJobId: customJob.id },
      })
   }, [asPath, customJob.id, push])

   const { trigger: toggleSaved, isMutating: isToggling } = useSWRMutation(
      `user-${userData?.id}-saveCustomJob-${customJob.id}`,
      async () => {
         if (isLoggedOut) {
            redirectToSignUp()
            return
         }
         if (!isSaved) {
            return await customJobRepo
               .saveCustomJob(userData.id, customJob)
               .then(() => {
                  dataLayerCustomJobEvent(
                     AnalyticsEvents.CustomJobSave,
                     customJob,
                     customJob?.group?.universityName,
                     {
                        userAuthId: userData.authId,
                        savedAt: new Date().toISOString(),
                     }
                  )
               })
         } else {
            return await customJobRepo.removeSavedCustomJob(
               userData.id,
               customJob.id
            )
         }
      },
      {
         onError: (error) => {
            errorNotification(
               error,
               "Sorry! Something failed, maybe try again later"
            )
         },
         onSuccess: () => {
            const message = data
               ? "❌ Job removed from your saved list."
               : "✅ Job saved successfully!"

            successNotification(message)
         },
      }
   )

   return { toggleSaved, isToggling, isSaved }
}
