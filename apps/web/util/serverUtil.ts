import { store } from "../pages/_app"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { fromDate } from "data/firebase/FirebaseInstance"
import { Group } from "@careerfairy/shared-lib/groups"

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
