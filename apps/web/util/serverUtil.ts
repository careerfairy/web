import { store } from "../pages/_app"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { omit } from "lodash"

export const getServerSideStream = async (livestreamId) => {
   let serverSideStream = null
   if (livestreamId) {
      // @ts-ignore
      const livestreamSnap = await store.firestore.get({
         collection: "livestreams",
         doc: livestreamId,
      })
      if (livestreamSnap.exists) {
         const livestreamEvent = {
            id: livestreamSnap.id,
            ...livestreamSnap.data(),
         } as LivestreamEvent

         serverSideStream =
            LivestreamPresenter.serializeDocument(livestreamEvent)

         return omit(serverSideStream, [
            "registeredUsers",
            "talentPool",
            "participatingStudents",
            "participants",
            "liveSpeakers",
            "author",
         ])
      }
   }
   return serverSideStream
}

export const getServerSideGroup = async (groupId) => {
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
