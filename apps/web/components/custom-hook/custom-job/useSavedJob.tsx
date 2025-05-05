import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { useAuth } from "HOCs/AuthProvider"
import useSWRMutation from "swr/mutation"

import { useRouter } from "next/router"
import { useCallback } from "react"
import { customJobRepo } from "../../../data/RepositoryInstances"
import useSnackbarNotifications from "../useSnackbarNotifications"
import { useFirestoreDocument } from "../utils/useFirestoreDocument"

export const useSavedJob = (customJob: CustomJob) => {
   const { userData, isLoggedOut } = useAuth()
   const { successNotification, errorNotification } = useSnackbarNotifications()
   const { push, asPath } = useRouter()
   const { data } = useFirestoreDocument<CustomJob>(
      "userData",
      [userData?.id, "savedJobs", customJob.id],
      {
         idField: "id",
      }
   )

   const isSaved = !!data

   const redirectToSignUp = useCallback(() => {
      return push({
         pathname: "/signup",
         query: { absolutePath: asPath, savedJobId: customJob.id },
      })
   }, [asPath, customJob.id, push])

   const { trigger: toggleSaved, isMutating: isToggling } = useSWRMutation(
      `user-${userData?.id}-saveCustomJob-${customJob.id}`,
      async () => {
         console.log("🚀 ~ handleSaveJob toggleSaved:")
         if (isLoggedOut) {
            redirectToSignUp()
            return
         }
         if (!isSaved) {
            return await customJobRepo.saveCustomJob(userData.id, customJob)
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
            successNotification(
               `You have ${data ? "" : "successfully"} ${
                  data ? "removed" : "saved"
               } the job!`,
               "Congrats"
            )
         },
      }
   )

   return { toggleSaved, isToggling, isSaved }
}
