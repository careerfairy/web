import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   LivestreamEvent,
   getEarliestEventBufferTime,
} from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import {
   collection,
   limit as firestoreLimit,
   getDocs,
   orderBy,
   query,
   where,
} from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWR from "swr"
import { errorLogAndNotify } from "util/CommonUtil"

// Allowed countries for panel events
const ALLOWED_COUNTRIES = ["AT", "CH", "DE", "LI"]

type Options = {
   initialData?: LivestreamEvent[]
   suspense?: boolean
   limit?: number
   disableCountryLimitation?: boolean
   userCountryCode?: string
   includeHidden?: boolean
}

export const useUpcomingPanelEventsSWR = (options?: Options) => {
   const { userData } = useAuth()
   const firestore = useFirestore()

   // Determine the user's country code with priority: userData.countryIsoCode > options.userCountryCode
   const userCountryCode = userData?.countryIsoCode || options?.userCountryCode

   // Check if user's country is in the allowed list
   const isCountryAllowed = options?.disableCountryLimitation
      ? true
      : userCountryCode
      ? ALLOWED_COUNTRIES.includes(userCountryCode)
      : false

   // Create conditional SWR key - null if country not allowed, otherwise include country code
   const swrKey = isCountryAllowed ? `panels-${userCountryCode}` : null

   const limit = options?.limit ?? 10
   const suspense = options?.suspense ?? false
   const includeHidden = options?.includeHidden ?? true // TODO: remove this before release
   const initialData = options?.initialData ?? []

   return useSWR<LivestreamEvent[]>(
      swrKey,
      async () => {
         const livestreamsQuery = query(
            collection(firestore, "livestreams"),
            where("start", ">", getEarliestEventBufferTime()),
            where("test", "==", false),
            where("isPanel", "==", true),
            orderBy("start", "asc"),
            ...(includeHidden ? [] : [where("hidden", "==", false)]),
            firestoreLimit(limit)
         ).withConverter(createGenericConverter<LivestreamEvent>())

         const querySnapshot = await getDocs(livestreamsQuery)

         return querySnapshot.docs.map((doc) => doc.data())
      },
      {
         suspense,
         fallbackData: initialData,
         onError: (error) =>
            errorLogAndNotify(error, "Failed to fetch upcoming panel events"),
      }
   )
}
