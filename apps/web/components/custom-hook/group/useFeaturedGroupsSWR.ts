import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { FieldOfStudyCategoryMap } from "@careerfairy/shared-lib/fieldOfStudy"
import { Group } from "@careerfairy/shared-lib/groups"
import { useAuth } from "HOCs/AuthProvider"
import { collection, getDocs, limit, query, where } from "firebase/firestore"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { FirestoreInstance } from "../../../data/firebase/FirebaseInstance"
import { reducedRemoteCallsOptions } from "../utils/useFunctionsSWRFetcher"

type Options = {
   totalItems?: number
   /**
    * Prevents the hook from fetching the sparks
    **/
   disabled?: boolean
}

export const useFeaturedGroupsSWR = (
   countryCode: string,
   options?: Options
) => {
   const { userData, isLoggedIn } = useAuth()

   const { totalItems = 4 } = options || {}

   const disabled =
      options?.disabled ||
      !countryCode?.length ||
      (isLoggedIn &&
         (!userData?.fieldOfStudy?.id ||
            (userData?.fieldOfStudy?.id &&
               !FieldOfStudyCategoryMap[userData?.fieldOfStudy?.id])))

   return useSWR(
      disabled
         ? null
         : [
              `get-featured-groups-${countryCode}-${userData?.authId}`,
              totalItems,
           ],
      async () => {
         const querySnapshot = await getDocs(
            query(
               collection(FirestoreInstance, "careerCenterData"),
               where("featured.targetCountries", "array-contains", countryCode),
               ...(totalItems ? [limit(totalItems)] : [])
            ).withConverter(createGenericConverter<Group>())
         )

         return querySnapshot.docs
            .map((doc) => doc.data())
            ?.filter((group) => {
               if (isLoggedIn && userData?.fieldOfStudy?.id) {
                  return group.featured?.targetAudience?.includes(
                     FieldOfStudyCategoryMap[userData?.fieldOfStudy?.id]
                  )
               }

               if (isLoggedIn && !userData?.fieldOfStudy?.id) {
                  return false
               }

               return !isLoggedIn
            })
            ?.sort(() => Math.random() - 0.5)
      },
      {
         ...reducedRemoteCallsOptions,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               key,
               totalItems,
            })
         },
      }
   )
}
