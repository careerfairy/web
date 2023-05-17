import useCollection from "./useCollection"
import { useMemo } from "react"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { livestreamRepo } from "../../data/RepositoryInstances"
import { LivestreamsDataParser } from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"
import { FieldOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"

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
}

const useListenToUpcomingStreams = (props?: Props) => {
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
   } = props

   const upcomingEventsQuery = useMemo(() => {
      let query = livestreamRepo.upcomingEventsQuery(!!filterByGroupId)

      if (filterByGroupId) {
         query = query.where("groupIds", "array-contains", filterByGroupId)
      }

      // only do this query if no interests IDs
      // since firestore does not support in and array-container-any on the same query
      if (languagesIds && !interestsIds) {
         query = query.where("language.code", "in", languagesIds)
      }

      if (interestsIds) {
         query = query.where("interestsIds", "array-contains-any", interestsIds)
      }

      if (!getHiddenEvents) {
         query = query.where("hidden", "==", false)
      }

      if (registeredUserEmail) {
         query = query.where(
            "registeredUsers",
            "array-contains",
            registeredUserEmail
         )
      }

      if (from) {
         query = query.where("start", ">", from)
      }

      if (fieldsOfStudy.length) {
         query = query.where(
            "targetFieldsOfStudy",
            "array-contains-any",
            fieldsOfStudy
         )
      }

      if (recordedOnly) {
         query = query.where("denyRecordingAccess", "==", false)
      }

      return query
   }, [
      fieldsOfStudy,
      filterByGroupId,
      from,
      getHiddenEvents,
      interestsIds,
      languagesIds,
      registeredUserEmail,
      recordedOnly,
   ])

   let { data, isLoading } = useCollection<LivestreamEvent>(
      upcomingEventsQuery,
      true
   )

   if (isLoading) return undefined

   let res = new LivestreamsDataParser(data).filterByNotEndedEvents()

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

export default useListenToUpcomingStreams
