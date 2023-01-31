import { store } from "../pages/_app"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { fromDate } from "data/firebase/FirebaseInstance"

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

export const getServerSideGroup = async (groupId: string) => {
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
   return serverSideGroup
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
