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
   // disabled?: boolean
}

export const useFeaturedGroupsSWR = (options?: Options) => {
   const { userData } = useAuth()

   const { totalItems = 4 } = options || {}

   const disabled =
      !userData?.countryIsoCode ||
      !userData?.fieldOfStudy?.id ||
      (userData?.fieldOfStudy?.id &&
         !FieldOfStudyCategoryMap[userData?.fieldOfStudy?.id])

   return useSWR(
      disabled ? null : [`get-featured-groups-${userData.authId}`, totalItems],
      async () => {
         const querySnapshot = await getDocs(
            query(
               collection(FirestoreInstance, "careerCenterData"),
               where(
                  "featured.targetCountries",
                  "array-contains",
                  userData?.countryIsoCode
               ),
               ...(totalItems ? [limit(totalItems)] : [])
            ).withConverter(createGenericConverter<Group>())
         )

         return querySnapshot.docs
            .map((doc) => doc.data())
            ?.filter((group) =>
               group.featured?.targetAudience?.includes(
                  FieldOfStudyCategoryMap[userData?.fieldOfStudy?.id]
               )
            )
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
