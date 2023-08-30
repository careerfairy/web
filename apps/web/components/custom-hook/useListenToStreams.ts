import { useMemo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { useFirestoreCollection } from "./utils/useFirestoreCollection"
import firebase from "firebase/compat/app"
import { TimeFrames } from "../views/group/admin/analytics-new/general/GeneralPageProvider"

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
   /**
    * The maximum number of LivestreamEvents to return. Will return `limit + 1` in case we want to know if there are more events.
    */
   limit?: number
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
      limit,
   } = props

   const eventsQuery = useMemo<firebase.firestore.Query>(() => {
      let query = listenToPastEvents
         ? livestreamRepo.getPastEventsFromQuery({
              fromDate: TimeFrames["Last 2 years"].start,
           })
         : livestreamRepo.upcomingEventsQuery(!!filterByGroupId)

      if (filterByGroupId) {
         query = query.where("groupIds", "array-contains", filterByGroupId)
      } else {
         if (interestsIds) {
            query = query.where(
               "interestsIds",
               "array-contains-any",
               interestsIds
            )
         }

         if (registeredUserEmail) {
            query = query.where(
               "registeredUsers",
               "array-contains",
               registeredUserEmail
            )
         }

         if (fieldsOfStudy?.length) {
            query = query.where(
               "targetFieldsOfStudy",
               "array-contains-any",
               fieldsOfStudy
            )
         }
      }

      // only do this query if no interests IDs
      // since firestore does not support in and array-container-any on the same query
      if (languagesIds && !interestsIds) {
         query = query.where("language.code", "in", languagesIds)
      }

      if (!getHiddenEvents) {
         query = query.where("hidden", "==", false)
      }

      if (from) {
         query = query.where("start", ">", from)
      }

      if (recordedOnly) {
         query = query.where("denyRecordingAccess", "==", false)
      }

      if (limit) {
         query = query.limit(limit + 1) // +1 to check if there are more events
      }

      return query
   }, [
      listenToPastEvents,
      filterByGroupId,
      languagesIds,
      interestsIds,
      getHiddenEvents,
      from,
      recordedOnly,
      limit,
      registeredUserEmail,
      fieldsOfStudy,
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

export default useListenToStreams
