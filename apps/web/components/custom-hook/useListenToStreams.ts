import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { getEarliestEventBufferTime } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, orderBy, query, where } from "firebase/firestore"
import { useMemo } from "react"
import { TimeFrames } from "../views/group/admin/analytics-new/general/GeneralPageProvider"
import { useFirestoreCollection } from "./utils/useFirestoreCollection"

type Props = {
   filterByGroupId?: string
   languagesIds?: string[]
   interestsIds?: string[]
   jobCheck?: boolean
   companyCountriesIds?: string[]
   companySizes?: string[]
   companyIndustriesIds?: string[]
   getHiddenEvents?: boolean
   registeredUserEmail?: string
   from?: Date
   fieldsOfStudy?: FieldOfStudy[]
   recordedOnly?: boolean
   listenToPastEvents?: boolean
}

/**
 * React Hook for listening to Livestreams.
 *
 * This hook applies filtering logic to the livestreams collection based on the provided props.
 * If a `filterByGroupId` prop is provided, the Firestore query will use an `array-contains` operation for `groupIds`,
 * while other `array-contains` and `array-contains-any` operations will be conducted client-side.
 * This approach is a workaround for the limitation that Firestore only allows one `array-contains` operation per query.
 *
 * @param {Props} props - The props that determine the Firestore query and client-side filters to apply.
 * @return {LivestreamEvent[]} - The LivestreamEvents that match the provided props.
 */
const useListenToStreams = (props?: Props): LivestreamEvent[] => {
   const {
      filterByGroupId,
      languagesIds,
      interestsIds,
      jobCheck,
      companyCountriesIds,
      companySizes,
      companyIndustriesIds,
      getHiddenEvents,
      registeredUserEmail,
      from,
      fieldsOfStudy,
      recordedOnly,
      listenToPastEvents,
   } = props

   const eventsQuery = useMemo(() => {
      let q = listenToPastEvents
         ? getPastEventsQuery({
              // Make sure this returns a Query object in modular style
              fromDate: TimeFrames["Last 2 years"].start,
           })
         : getUpcomingEventsQuery(!!filterByGroupId) // Make sure this returns a Query object in modular style

      if (filterByGroupId) {
         q = query(q, where("groupIds", "array-contains", filterByGroupId))
      } else {
         if (interestsIds) {
            q = query(
               q,
               where("interestsIds", "array-contains-any", interestsIds)
            )
         }
         if (registeredUserEmail) {
            q = query(
               q,
               where("registeredUsers", "array-contains", registeredUserEmail)
            )
         }
         if (fieldsOfStudy?.length) {
            q = query(
               q,
               where("targetFieldsOfStudy", "array-contains-any", fieldsOfStudy)
            )
         }
      }

      if (languagesIds && !interestsIds) {
         q = query(q, where("language.code", "in", languagesIds))
      }

      if (!getHiddenEvents) {
         q = query(q, where("hidden", "==", false))
      }

      if (from) {
         q = query(q, where("start", ">", from))
      }

      if (recordedOnly) {
         q = query(q, where("denyRecordingAccess", "==", false))
      }

      return q
   }, [
      fieldsOfStudy,
      filterByGroupId,
      from,
      getHiddenEvents,
      interestsIds,
      languagesIds,
      listenToPastEvents,
      recordedOnly,
      registeredUserEmail,
   ])

   let { data, status } = useFirestoreCollection<LivestreamEvent>(eventsQuery, {
      suspense: false,
   })

   if (status === "loading") return undefined

   let res = new LivestreamsDataParser(data)

   /**
    * If a `filterByGroupId` is provided, conduct client-side filters for `interestsIds`, `registeredUsers`, and `targetFieldsOfStudy`.
    * These filters are performed on the client-side due to Firestore's limitation of one `array-contains` operation per query.
    */
   if (filterByGroupId) {
      if (interestsIds) {
         res = res.filterByInterests(interestsIds) // Ensure this method exists in LivestreamsDataParser
      }

      if (registeredUserEmail) {
         res = res.filterByRegisteredUser(registeredUserEmail) // Ensure this method exists in LivestreamsDataParser
      }

      if (fieldsOfStudy?.length) {
         res = res.filterByTargetFieldsOfStudy(fieldsOfStudy) // Ensure this method exists in LivestreamsDataParser
      }
   }

   if (!listenToPastEvents) {
      res = res.filterByNotEndedEvents()
   }

   if (jobCheck) {
      res = res.filterByHasJobs()
   }

   // needs to filter company metadata on client side since firebase can not do multiple "array-contains-any" on the same query
   if (companyCountriesIds) {
      res = res.filterByCompanyCountry(companyCountriesIds)
   }

   if (companyIndustriesIds) {
      res = res.filterByCompanyIndustry(companyIndustriesIds)
   }

   if (companySizes) {
      res = res.filterByCompanySize(companySizes)
   }

   // only do this filter on client side if any interests IDs filter
   // since firestore does not support in and array-container-any on the same query
   if (languagesIds && interestsIds) {
      res = res.filterByLanguages(languagesIds)
   }

   return res.complementaryFields().get()
}

type PastEventsOptions = {
   fromDate: Date
   limit?: number
   filterByGroupId?: string
   showHidden?: boolean
}
const getPastEventsQuery = (options: PastEventsOptions) => {
   let baseQuery = collection(FirestoreInstance, "livestreams")
   let q = query(
      baseQuery,
      where("start", ">", options.fromDate),
      where("start", "<", new Date()),
      where("test", "==", false),
      orderBy("start", "desc")
   )

   if (options.limit) {
      q = query(q, limit(options.limit))
   }

   if (options.filterByGroupId) {
      q = query(q, where("groupIds", "array-contains", options.filterByGroupId))
   }

   if (options.showHidden === false) {
      q = query(q, where("hidden", "==", false))
   }

   return q
}

const getUpcomingEventsQuery = (showHidden: boolean = false) => {
   const baseQuery = collection(FirestoreInstance, "livestreams")
   let q = query(
      baseQuery,
      where("start", ">", getEarliestEventBufferTime()),
      where("test", "==", false),
      orderBy("start", "asc")
   )

   if (showHidden === false) {
      q = query(q, where("hidden", "==", false))
   }

   return q
}

export default useListenToStreams
