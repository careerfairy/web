import { useCallback, useEffect, useState } from "react"
import { SavedRecruiter } from "@careerfairy/shared-lib/dist/users"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { GENERAL_ERROR } from "components/util/constants"
import { useSnackbar } from "notistack"
import { userRepo } from "../../../../../data/RepositoryInstances"

const useRecruiterData = (speakerId) => {
   const [recruiterData, setRecruiterData] = useState<SavedRecruiter>(null)
   const [recruiterSaved, setRecruiterSaved] = useState<Boolean>(false)
   const [isLoading, setIsLoading] = useState(true)
   const { userData } = useAuth()
   const { enqueueSnackbar } = useSnackbar()

   useEffect(() => {
      // user needs to be logged in
      if (!userData?.userEmail) return

      // fetch so that we can disable the save button if the recruiter is already saved
      userRepo
         .getSavedRecruiter(userData.userEmail, speakerId)
         .then((recruiter) => {
            setRecruiterData(recruiter)
         })
         .catch((err) => {
            console.error(err)
         })
         .finally(() => {
            setIsLoading(false)
         })
   }, [userData?.userEmail, speakerId])

   const saveRecruiter = useCallback(
      (recruiter: SavedRecruiter) => {
         setIsLoading(true)
         return userRepo
            .saveRecruiter(userData?.userEmail, recruiter)
            .then((r) => {
               setRecruiterSaved(true)
               enqueueSnackbar(
                  "The Speaker details were saved, check later on your profile!",
                  {
                     variant: "success",
                     preventDuplicate: true,
                  }
               )
               return r
            })
            .catch((err) => {
               console.error(err)
               enqueueSnackbar(GENERAL_ERROR, {
                  variant: "error",
                  preventDuplicate: true,
               })
            })
            .finally(() => {
               setIsLoading(false)
            })
      },
      [userData?.userEmail]
   )

   return {
      recruiterData,
      isLoading,
      saveRecruiter,
      recruiterSaved,
   }
}

export default useRecruiterData
