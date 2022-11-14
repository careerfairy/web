import { store } from "../pages/_app"
import { LivestreamPresenter } from "@careerfairy/shared-lib/dist/livestreams/LivestreamPresenter"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { omit, pick } from "lodash"

export const mapServerSideStream = (livestream) => {
   return {
      id: livestream.id,
      company: livestream.company || null,
      title: livestream.title || null,
      companyLogoUrl: livestream.companyLogoUrl || null,
      backgroundImageUrl: livestream.backgroundImageUrl || null,
      speakers: livestream.speakers || [],
      summary: livestream.summary || null,
      createdDateString: livestream.created?.toDate?.().toString() || null,
      lastUpdatedDateString:
         livestream.lastUpdated?.toDate?.().toString() || null,
      startDateString: livestream.start?.toDate?.().toString() || null,
      questionsDisabled: livestream.questionsDisabled || null,
   }
}

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

export const parseStreamDates = (stream) => {
   const newStream = { ...stream }
   if (newStream.createdDateString) {
      newStream.createdDate = new Date(Date.parse(newStream.createdDateString))
   }
   if (newStream.lastUpdatedDateString) {
      newStream.lastUpdatedDate = new Date(
         Date.parse(newStream.lastUpdatedDateString)
      )
   }
   if (newStream.startDateString) {
      newStream.startDate = new Date(Date.parse(newStream.startDateString))
   }
   return newStream
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
