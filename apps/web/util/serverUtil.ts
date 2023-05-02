import { store } from "../pages/_app"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { fromDate } from "data/firebase/FirebaseInstance"
import { Group } from "@careerfairy/shared-lib/groups"
import nookies from "nookies"
import CookiesUtil from "./CookiesUtil"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"

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
