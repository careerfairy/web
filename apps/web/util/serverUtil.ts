import { CustomJobsPresenter } from "@careerfairy/shared-lib/customJobs/CustomJobsPresenter"
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import {
   Group,
   SerializedGroup,
   deserializeGroup,
   serializeGroup,
} from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { GetEventsOfGroupOptions } from "@careerfairy/shared-lib/livestreams/LivestreamRepository"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import {
   MAX_PAST_STREAMS,
   MAX_UPCOMING_STREAMS,
} from "components/views/company-page/EventSection"
import { getLivestreamDialogData } from "components/views/livestream-dialog"
import { groupRepo, livestreamRepo } from "data/RepositoryInstances"
import { fromDate } from "data/firebase/FirebaseInstance"
import { livestreamService } from "data/firebase/LivestreamService"
import { GetServerSidePropsContext, GetStaticPathsContext } from "next"
import nookies from "nookies"
import { ParsedUrlQuery } from "querystring"
import { store } from "store"
import CookiesUtil from "./CookiesUtil"

export const getServerSideStream = async (
   livestreamId: string
): Promise<LivestreamEvent> => {
   let serverSideStream = null
   if (livestreamId) {
      // @ts-ignore
      const livestreamSnap = await store.firestore.get({
         collection: "livestreams",
         doc: livestreamId,
      })
      if (livestreamSnap.exists) {
         serverSideStream = {
            id: livestreamSnap.id,
            ...livestreamSnap.data(),
         } as LivestreamEvent
      }
   }
   return serverSideStream
}

export const getServerSideCustomJob = async (
   customJobId: string
): Promise<CustomJob> => {
   let serverSideCustomJob = null
   if (customJobId) {
      // @ts-ignore
      const customJobSnap = await store.firestore.get({
         collection: "customJobs",
         doc: customJobId,
      })
      if (customJobSnap.exists) {
         serverSideCustomJob = {
            id: customJobSnap.id,
            ...customJobSnap.data(),
         } as CustomJob
      }
   }
   return serverSideCustomJob
}

export const getServerSideUserStats = async (
   email: string
): Promise<UserStats> => {
   if (!email) return null

   // @ts-ignore
   const snap = await store.firestore.get({
      collection: "userData",
      doc: email,
      subcollections: [{ collection: "stats", doc: "stats" }],
      storeAs: "userStats",
   })

   if (snap.exists) {
      return snap.data() as UserStats
   } else {
      return null
   }
}

export const getServerSideUserData = async (
   email: string
): Promise<UserData> => {
   if (!email) return null

   // @ts-ignore
   const snap = await store.firestore.get({
      collection: "userData",
      doc: email,
      storeAs: "userData",
   })

   if (snap.exists) {
      return snap.data() as UserData
   } else {
      return null
   }
}

export const getServerSideGroup = async (groupId: string): Promise<Group> => {
   let serverSideGroup = {}
   // @ts-ignore
   const snap = await store.firestore.get({
      collection: "careerCenterData",
      doc: groupId,
      storeAs: `group ${groupId}`,
   })
   if (snap.exists) {
      serverSideGroup = snap.data()
      // @ts-ignore
      delete serverSideGroup.adminEmails
      // @ts-ignore
      serverSideGroup.id = snap.id
   }
   return serverSideGroup as Group
}

/**
 * To parse the events coming from server side
 */

export const mapFromServerSide = (
   events: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [p: string]: any
   }[]
) => {
   if (!events) return []
   return events.map((e) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LivestreamPresenter.parseDocument(e as any, fromDate)
   )
}

export const mapCustomJobsFromServerSide = (
   data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [p: string]: any
   }[]
) => {
   if (!data) return []
   return data.map((job) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      CustomJobsPresenter.parseDocument(job as any, fromDate)
   )
}

/**
 * Deserializes a single group object.
 * This function is used to convert a serialized group object (usually from a server response) into a Group object.
 *
 * @param {SerializedGroup} group - The group to deserialize.
 * @returns {Group} The deserialized group.
 */
export const deserializeGroupClient = (group: SerializedGroup): Group => {
   return deserializeGroup(group, fromDate)
}

/**
 * Deserializes an array of group objects.
 * This function is used to convert an array of serialized group objects (usually from a server response) into an array of Group objects.
 *
 * @param {SerializedGroup[]} groups - The groups to deserialize.
 * @returns {Group[]} The deserialized groups.
 */
export const deserializeGroups = (groups: SerializedGroup[]): Group[] => {
   return groups.map((group) => deserializeGroupClient(group))
}

export const getUserTokenFromCookie = (
   arg: Parameters<typeof nookies.get>[0]
) => {
   const cookies = nookies.get(arg)

   let token: { email: string } | null = null
   try {
      token = CookiesUtil.parseJwt({
         token: cookies.token,
         isServerSide: true,
      })

      return token
   } catch (e) {
      console.error("Failed to parse cookie.token", e, cookies.token)
   }
}

export const parseJwtServerSide = (token?: string) => {
   if (!token) return null
   const base64Url = token.split(".")[1]
   const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
   const jsonPayload = decodeURIComponent(
      atob(base64)
         .split("")
         .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
         })
         .join("")
   )

   return JSON.parse(jsonPayload)
}

/**
 * Converts a ParsedUrlQuery object into a URL query string.
 *
 * @param {ParsedUrlQuery} query - A ParsedUrlQuery object.
 * @returns {string} A URL query string.
 *
 * @example
 * // Returns 'name=John&age=30'
 * convertQueryParamsToString({ name: 'John', age: '30' })
 */
export const convertQueryParamsToString = (query: ParsedUrlQuery): string => {
   const queryEntries: [string, string][] = Object.entries(query).map(
      ([key, value]) => [key, String(value)]
   )
   return new URLSearchParams(queryEntries).toString()
}

/**
 * Fetches upcoming and past livestream events for a given group, and retrieves livestream dialog data.
 *
 * @param {string} groupId - The ID of the group to fetch livestream events for.
 * @param {Object} context - The context object, usually provided by Next.js methods like getServerSideProps or getStaticProps.
 * @param {boolean} noLimits - Whether to fetch all upcoming and past livestreams without limits.
 * @returns {Promise<Object>} An object containing arrays of upcoming and past livestreams, and livestream dialog data.
 *
 * @example
 *
 * const { serverSideUpcomingLivestreams, serverSidePastLivestreams, livestreamDialogData } =
 *    await getLivestreamsAndDialogData(serverSideGroup?.groupId, context);
 */
export const getLivestreamsAndDialogData = async (
   groupId: string,
   context: GetServerSidePropsContext | GetStaticPathsContext,
   options?: GetEventsOfGroupOptions
) => {
   const results = await Promise.allSettled([
      livestreamRepo.getEventsOfGroup(
         groupId,
         "upcoming",
         options || {
            hideHidden: null,
            limit: MAX_UPCOMING_STREAMS + 1, // fetch 10 + 1 to know if there are more
         }
      ),
      livestreamRepo.getEventsOfGroup(
         groupId,
         "past",
         options || {
            hideHidden: null,
            limit: MAX_PAST_STREAMS + 1, // fetch 5 + 1 to know if there are more
         }
      ),
      groupRepo.getGroupAvailableCustomJobs(groupId),
      getLivestreamDialogData(context),
   ])

   const [
      serverSideUpcomingLivestreamsResult,
      serverSidePastLivestreamsResult,
      serverSideGroupCustomJobsResult,
      livestreamDialogDataResult,
   ] = results

   const serverSideUpcomingLivestreams =
      serverSideUpcomingLivestreamsResult.status === "fulfilled"
         ? serverSideUpcomingLivestreamsResult.value
         : []

   const serverSidePastLivestreams =
      serverSidePastLivestreamsResult.status === "fulfilled"
         ? serverSidePastLivestreamsResult.value
         : []

   const serverSideGroupAvailableCustomJobs =
      serverSideGroupCustomJobsResult.status === "fulfilled"
         ? serverSideGroupCustomJobsResult.value
         : []

   const livestreamDialogData =
      livestreamDialogDataResult.status === "fulfilled"
         ? livestreamDialogDataResult.value
         : null

   return {
      serverSideUpcomingLivestreams,
      serverSidePastLivestreams,
      serverSideGroupAvailableCustomJobs,
      livestreamDialogData,
   }
}

const CF_GROUP_ID = "i8NjOiRu85ohJWDuFPwo"

export type LandingPageEventType = "panels" | "industry"

export type IndustryLandingPageOptions = {
   type: "industry"
   industries: string[]
   recordingsFromDate?: Date
   upcomingLimit?: number
   recordingsLimit?: number
}

export type PanelsLandingPageOptions = {
   type: "panels"
}

export type LandingPageOptions =
   | IndustryLandingPageOptions
   | PanelsLandingPageOptions

export type LandingPageData = {
   serverSidePanelEvents: any[]
   serverSideCompanies: SerializedGroup[]
   serverSideRecentLivestreams: any[]
   serverSideRecordings?: any[]
}

/**
 * Fetches and processes data for industry/topic landing pages (panels, consulting, engineering, etc.)
 * This function encapsulates the common logic for fetching events, companies, and recent livestreams.
 *
 * @param {LandingPageOptions} options - Configuration options for the landing page type
 * @returns {Promise<LandingPageData>} Serialized data ready for Next.js props
 *
 * @example
 * // For panels page
 * const data = await getLandingPageData({ type: "panels" })
 *
 * @example
 * // For consulting page
 * const data = await getLandingPageData({
 *    type: "industry",
 *    industries: ["ManagementConsulting"],
 *    recordingsFromDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
 *    upcomingLimit: 6,
 *    recordingsLimit: 6
 * })
 */
export const getLandingPageData = async (
   options: LandingPageOptions
): Promise<LandingPageData> => {
   try {
      let mainEvents: LivestreamEvent[] = []
      let recordings: LivestreamEvent[] = []

      // Fetch data based on page type
      if (options.type === "panels") {
         // Fetch panels and recent livestreams in parallel
         const [recentLivestreams, allPanels] = await Promise.all([
            livestreamRepo.getUpcomingEvents(10),
            livestreamRepo.getAllPanels(),
         ])

         mainEvents = allPanels
         recordings = [] // Panels page doesn't have recordings section

         // Extract unique groupIds from all panels
         const allGroupIds = mainEvents
            .flatMap((panel) => panel.groupIds || [])
            .filter((groupId, index, array) => array.indexOf(groupId) === index)

         // Fetch companies from the groupIds
         const companies =
            allGroupIds.length > 0
               ? await groupRepo.getGroupsByIds(allGroupIds)
               : []

         // Process and serialize data
         return processLandingPageData(
            mainEvents,
            recordings,
            companies,
            recentLivestreams
         )
      } else if (options.type === "industry") {
         // Fetch industry-specific data in parallel
         const [recentLivestreams, upcomingEvents, pastEvents] =
            await Promise.all([
               livestreamRepo.getUpcomingEvents(10),
               livestreamService.getUpcomingEventsByIndustries(
                  options.industries,
                  options.upcomingLimit || 6
               ),
               livestreamService.getPastEventsByIndustries(
                  options.industries,
                  options.recordingsFromDate ||
                     new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                  options.recordingsLimit || 6
               ),
            ])

         mainEvents = upcomingEvents
         recordings = pastEvents

         // Extract unique groupIds from industry livestreams
         const allGroupIds = mainEvents
            .flatMap((event) => event.groupIds || [])
            .filter((groupId, index, array) => array.indexOf(groupId) === index)

         // Fetch companies from the groupIds
         const companies =
            allGroupIds.length > 0
               ? await groupRepo.getGroupsByIds(allGroupIds)
               : []

         // Process and serialize data
         return processLandingPageData(
            mainEvents,
            recordings,
            companies,
            recentLivestreams
         )
      }

      // Fallback empty data
      return {
         serverSidePanelEvents: [],
         serverSideCompanies: [],
         serverSideRecentLivestreams: [],
         serverSideRecordings: [],
      }
   } catch (error) {
      console.error("Error fetching landing page data:", error)
      return {
         serverSidePanelEvents: [],
         serverSideCompanies: [],
         serverSideRecentLivestreams: [],
         serverSideRecordings: [],
      }
   }
}

/**
 * Processes and serializes landing page data
 * Handles filtering moderators and CF group, and serialization
 */
function processLandingPageData(
   mainEvents: LivestreamEvent[],
   recordings: LivestreamEvent[],
   companies: Group[],
   recentLivestreams: LivestreamEvent[]
): LandingPageData {
   // Serialize events for server-side props
   const serializedMainEvents = mainEvents.map((event) =>
      LivestreamPresenter.serializeDocument(event)
   )

   // Filter out moderators from speakers
   const eventsWithoutModerators = serializedMainEvents.map((event) => {
      event.speakers = event.speakers?.filter(
         (speaker) => speaker.position !== "Moderator"
      )
      return {
         ...event,
         speakers: event.speakers,
      }
   })

   // Serialize recent livestreams
   const serializedRecentLivestreams =
      recentLivestreams?.map((stream) =>
         LivestreamPresenter.serializeDocument(stream)
      ) || []

   // Serialize recordings if they exist
   const serializedRecordings = recordings.map((recording) =>
      LivestreamPresenter.serializeDocument(recording)
   )

   // Serialize companies
   const serializedCompanies = companies.map((company) =>
      serializeGroup(company)
   )

   // Filter out CareerFairy group and universities
   const serializedCompaniesWithoutCF = serializedCompanies.filter(
      (company) => company.id !== CF_GROUP_ID && !company.universityCode
   )

   return {
      serverSidePanelEvents: eventsWithoutModerators,
      serverSideCompanies: serializedCompaniesWithoutCF,
      serverSideRecentLivestreams: serializedRecentLivestreams,
      serverSideRecordings: serializedRecordings,
   }
}
