import { store } from "../pages/_app"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { fromDate } from "data/firebase/FirebaseInstance"
import { Group } from "@careerfairy/shared-lib/groups"
import nookies from "nookies"
import CookiesUtil from "./CookiesUtil"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { ParsedUrlQuery } from "querystring"
import { GetServerSidePropsContext, GetStaticPathsContext } from "next"
import {
   MAX_PAST_STREAMS,
   MAX_UPCOMING_STREAMS,
} from "components/views/company-page/EventSection"
import { livestreamRepo, sparksRepo } from "data/RepositoryInstances"
import { getLivestreamDialogData } from "components/views/livestream-dialog"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

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
export const mapFromServerSide = (events: { [p: string]: any }[]) => {
   if (!events) return []
   return events.map((e) =>
      LivestreamPresenter.parseDocument(e as any, fromDate)
   )
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
   let base64Url = token.split(".")[1]
   let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
   let jsonPayload = decodeURIComponent(
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
 * @returns {Promise<Object>} An object containing arrays of upcoming and past livestreams, and livestream dialog data.
 *
 * @example
 *
 * const { serverSideUpcomingLivestreams, serverSidePastLivestreams, livestreamDialogData } =
 *    await getLivestreamsAndDialogData(serverSideGroup?.groupId, context);
 */
export const getLivestreamsAndDialogData = async (
   groupId: string,
   context: GetServerSidePropsContext | GetStaticPathsContext
) => {
   const results = await Promise.allSettled([
      livestreamRepo.getEventsOfGroup(groupId, "upcoming", {
         limit: MAX_UPCOMING_STREAMS + 1, // fetch 10 + 1 to know if there are more
      }),
      livestreamRepo.getEventsOfGroup(groupId, "past", {
         limit: MAX_PAST_STREAMS + 1, // fetch 5 + 1 to know if there are more
      }),
      getLivestreamDialogData(context),
   ])

   const [
      serverSideUpcomingLivestreamsResult,
      serverSidePastLivestreamsResult,
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

   const livestreamDialogData =
      livestreamDialogDataResult.status === "fulfilled"
         ? livestreamDialogDataResult.value
         : null

   return {
      serverSideUpcomingLivestreams,
      serverSidePastLivestreams,
      livestreamDialogData,
   }
}

export const getServerSideSparks = async (limit?: number): Promise<Spark[]> => {
   // @ts-ignore
   return sparksRepo.getSparks(limit)
}
