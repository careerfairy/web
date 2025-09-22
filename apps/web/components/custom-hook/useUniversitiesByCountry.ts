import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UniversityCountry } from "@careerfairy/shared-lib/universities"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, getDocs, query, where } from "firebase/firestore"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"
import { reducedRemoteCallsOptions } from "./utils/useFunctionsSWRFetcher"

const getKey = (universityCountryCode: string) => {
   return `get-universities-by-country-${universityCountryCode}`
}
export const useUniversitiesByCountry = (universityCountryCode: string) => {
   const key = getKey(universityCountryCode)

   return useSWR(
      [key],
      async () => {
         const querySnapshot = await getDocs(
            query(
               collection(FirestoreInstance, "universitiesByCountry"),
               where("countryId", "==", universityCountryCode)
            ).withConverter(createGenericConverter<UniversityCountry>())
         )

         return querySnapshot.docs?.map((doc) => doc.data()) || []
      },
      {
         ...reducedRemoteCallsOptions,
         onError: (error, key) => {
            errorLogAndNotify(error, {
               message: "Error fetching universities by country",
               key,
               universityCountryCode,
            })
         },
         suspense: false,
      }
   )
}
