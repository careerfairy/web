import { store } from "../pages/_app"

export const mapServerSideStream = (livestream) => {
   return {
      id: livestream.id,
      company: livestream.company || null,
      title: livestream.title || null,
      companyLogoUrl: livestream.companyLogoUrl || null,
      backgroundImageUrl: livestream.backgroundImageUrl || null,
      isBeta: livestream.isBeta ?? null,
      speakers: livestream.speakers || [],
      summary: livestream.summary || null,
      createdDateString: livestream.created?.toDate?.().toString() || null,
      lastUpdatedDateString:
         livestream.lastUpdated?.toDate?.().toString() || null,
      startDateString: livestream.start?.toDate?.().toString() || null,
   }
}

export const getServerSideStream = async (livestreamId) => {
   let serverSideStream = null
   if (livestreamId) {
      const livestreamSnap = await store.firestore.get({
         collection: "livestreams",
         doc: livestreamId,
      })
      if (livestreamSnap.exists) {
         serverSideStream = mapServerSideStream({
            id: livestreamSnap.id,
            ...livestreamSnap.data(),
         })
      }
   }
   return serverSideStream
}

export const getServerSideStreamAdminPreferences = async (livestreamId) => {
   let streamAdminPreferences = null
   if (livestreamId) {
      const preferenceSnap = await store.firestore.get({
         collection: "livestreams",
         doc: livestreamId,
         subcollections: [
            {
               collection: "preferences",
               doc: "adminPreference",
            },
         ],
      })
      if (preferenceSnap.exists) {
         streamAdminPreferences = preferenceSnap.data()
      }
   }
   return streamAdminPreferences
}

export const serializeServerSideStream = (serverSideStream) => {
   const serverSideLivestream = { ...serverSideStream }
   delete serverSideLivestream.registeredUsers
   delete serverSideLivestream.registeredStudentsCount
   delete serverSideLivestream.currentSpeakerId
   delete serverSideLivestream.participatingStudents
   delete serverSideLivestream.participatingStudentsCount
   delete serverSideLivestream.talentPool
   delete serverSideLivestream.targetGroups
   delete serverSideLivestream.hasStarted
   delete serverSideLivestream.hasSentEmails
   delete serverSideLivestream.liveSpeakers
   delete serverSideLivestream.hasEnded
   delete serverSideLivestream.hidden
   delete serverSideLivestream.test
   delete serverSideLivestream.adminEmails
   delete serverSideLivestream.adminEmail
   delete serverSideLivestream.author
   delete serverSideLivestream.lastUpdatedAuthorInfo
   delete serverSideLivestream.status

   serverSideLivestream.createdDateString =
      serverSideLivestream.created?.toDate?.().toString() || null
   serverSideLivestream.lastUpdatedDateString =
      serverSideLivestream.lastUpdated?.toDate?.().toString() || null
   serverSideLivestream.startDateString =
      serverSideLivestream.start?.toDate?.().toString() || null

   // Clear out props that have methods of which the server can't parse
   delete serverSideLivestream.created
   delete serverSideLivestream.lastUpdated
   delete serverSideLivestream.start

   return serverSideLivestream
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

export const convertStreamJsDatesToTimestamps = (
   stream,
   jsDateToTimestampCallback
) => {
   const newStream = { ...stream }
   if (newStream.createdDate) {
      newStream.created = jsDateToTimestampCallback(newStream.createdDate)
   }
   if (newStream.lastUpdatedDate) {
      newStream.lastUpdated = jsDateToTimestampCallback(
         newStream.lastUpdatedDate
      )
   }
   if (newStream.startDate) {
      newStream.start = jsDateToTimestampCallback(newStream.startDate)
   }
   return newStream
}
export const getServerSideGroup = async (groupId) => {
   let serverSideGroup = {}
   const snap = await store.firestore.get({
      collection: "careerCenterData",
      doc: groupId,
      storeAs: `group ${groupId}`,
   })
   if (snap.exists) {
      serverSideGroup = snap.data()
      delete serverSideGroup.adminEmails
      serverSideGroup.id = snap.id
   }
   return serverSideGroup
}
