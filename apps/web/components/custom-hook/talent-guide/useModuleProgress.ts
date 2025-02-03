import { TalentGuideProgress } from "@careerfairy/shared-lib/talent-guide"
import { useAuth } from "HOCs/AuthProvider"
import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { useEffect } from "react"
import { ReactFireOptions, useFirestoreDocData } from "reactfire"
import { errorLogAndNotify } from "util/CommonUtil"

const options: ReactFireOptions = {
   idField: "id",
   suspense: false,
}
/**
 * Custom hook to get a user's progress for a specific module
 * @param moduleId - The Hygraph module ID
 * @param options - Optional ReactFire options
 * @returns The module progress data and loading status
 */
export const useModuleProgress = (moduleId: string) => {
   const { authenticatedUser } = useAuth()

   const docRef = talentGuideProgressService.getModuleProgressRef(
      moduleId,
      authenticatedUser.uid
   )

   const {
      data: moduleProgress,
      error,
      status,
   } = useFirestoreDocData<TalentGuideProgress>(docRef, options)

   useEffect(() => {
      if (error) {
         errorLogAndNotify(error, {
            message: "Error subscribing to module progress",
            moduleId,
         })
      }
   }, [error, moduleId])

   return { moduleProgress, loading: status === "loading" }
}
