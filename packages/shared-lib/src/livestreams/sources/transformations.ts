import {
   RegistrationSource,
   RegistrationSourceIds,
   VALID_SOURCES,
} from "./sources"
import { RegistrationSourcesResponseItem } from "../../functions/groupAnalyticsTypes"
import {
   LivestreamCustomJobAssociationPresenter,
   LivestreamEvent,
} from "../livestreams"
import {
   fromDateConverter,
   fromDateFirestoreFn,
   toDate,
} from "../../firebaseTypes"
import { PublicCustomJob } from "../../customJobs/customJobs"

export type RegistrationSourceWithDates = {
   source: Omit<RegistrationSource, "match">
   dates: Date[]
}

/**
 * Aggregate registrations by Source
 *
 * Source => Registrations[]
 */
export const sourcesByDate = (
   data: RegistrationSourcesResponseItem[]
): RegistrationSourceWithDates[] => {
   const res: RegistrationSourceWithDates[] = []

   function addToResults(
      source: RegistrationSource,
      item: RegistrationSourcesResponseItem
   ) {
      const entryIdx = res.findIndex(
         (e) => e.source.displayName === source.displayName
      )

      if (entryIdx > -1) {
         // insert a date in existing array entry
         const refToEntry = res[entryIdx]
         res[entryIdx] = {
            ...refToEntry,
            dates: refToEntry.dates.concat(item.registered.date),
         }
      } else {
         // add new array entry with new date
         res.push({
            source,
            dates: [item.registered.date],
         })
      }
   }

   for (let registration of data) {
      if (registration.registered?.date) {
         // it's a valid registration

         // If the registration was made through a spark
         if (registration.registered.sparkId) {
            addToResults(
               VALID_SOURCES.find(
                  (source) => source.id == RegistrationSourceIds.Sparks
               ),
               registration
            )
         } else {
            for (let source of VALID_SOURCES) {
               if (source.match(registration.registered.utm)) {
                  addToResults(source, registration)
                  break // one registration only matches a single source
               }
            }
         }
      }
   }

   return res
}

/**
 * Aggregate data into buckets of days
 * @param entries
 */
export const rollupByDay = (
   entries: { x: Date; y: number }[]
): { x: Date; y: number }[] => {
   const map = {}

   for (let entry of entries) {
      const key = entry.x.toISOString().slice(0, 10) // 2022-10-09

      if (map[key]) {
         map[key] = map[key] + entry.y
      } else {
         map[key] = entry.y
      }
   }

   const res = []
   for (let mapKey in map) {
      res.push({ x: new Date(mapKey), y: map[mapKey] })
   }

   return res.sort((a, b) => b.x.getTime() - a.x.getTime())
}

export type UTMsPercentage = {
   percent: number // source percentage in relation with all livestream registrations
   total: number // registrations from this source
   source: Omit<RegistrationSource, "match">
}

/**
 * Aggregate sources for a given livestream
 */
export const sourcesByLivestream = (
   data: RegistrationSourcesResponseItem[],
   filterByLivestreamId?: string
): UTMsPercentage[] => {
   if (!data || data.length === 0) return []

   const filtered = filterByLivestreamId
      ? data.filter((entry) => entry.livestreamId === filterByLivestreamId)
      : data

   const stats = sourcesByDate(filtered)

   return stats
      .map((entry) => ({
         source: entry.source,
         total: entry.dates.length,
         percent: Math.round((entry.dates.length / filtered.length) * 100),
      }))
      .sort((a, b) => {
         return b.total - a.total
      })
}

/**
 * Older livestreams registrations have a fixed registration date
 *   17 Mar
 *
 * With this fix, we set the registration date to the livestream start date
 */
export const fixLivestreamRegistrationDates = (
   data: RegistrationSourcesResponseItem[],
   livestreams: LivestreamEvent[]
): RegistrationSourcesResponseItem[] => {
   const referenceTimestamp = 1584411840000 // 17 Mar

   return data.map((entry) => {
      if (entry.registered?.date) {
         if (entry.registered.date.getTime() === referenceTimestamp) {
            const livestream = livestreams.find(
               (l) => entry.livestreamId === l.id
            )

            entry.registered.date = livestream.start.toDate()
         }
      }

      return entry
   })
}

export const formatLivestreamCustomJobAssociationToPublicCustomJob = (
   jobs: LivestreamCustomJobAssociationPresenter[],
   fromDate: fromDateFirestoreFn
): PublicCustomJob[] => {
   return jobs?.map((job) => ({
      ...job,
      deadline: fromDateConverter(new Date(job?.deadline), fromDate),
   }))
}

export const formatPublicCustomJobToLivestreamCustomJobAssociation = (
   jobs: PublicCustomJob[]
): LivestreamCustomJobAssociationPresenter[] => {
   return jobs?.map((job) => {
      return {
         ...job,
         deadline: job.deadline ? toDate(job.deadline).toISOString() : null,
      }
   })
}
