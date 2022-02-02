import { store } from "../pages/_app";

export const getServerStreamData = (livestreamSnap) => {
   const streamData = livestreamSnap.data();
   return {
      id: livestreamSnap.id,
      company: streamData.company,
      title: streamData.title,
      companyLogoUrl: streamData.companyLogoUrl,
      backgroundImageUrl: streamData.backgroundImageUrl,
      speakers: streamData.speakers,
      summary: streamData.summary,
      createdDateString: streamData.created?.toDate?.().toString() || null,
      lastUpdatedDateString:
         streamData.lastUpdated?.toDate?.().toString() || null,
      startDateString: streamData.start?.toDate?.().toString() || null,
   };
};

export const getServerSideStream = async (livestreamId) => {
   let serverSideStream = null;
   if (livestreamId) {
      const livestreamSnap = await store.firestore.get({
         collection: "livestreams",
         doc: livestreamId,
      });
      if (livestreamSnap.exists) {
         serverSideStream = getServerStreamData(livestreamSnap);
      }
   }
   return serverSideStream;
};

export const serializeServerSideStream = (serverSideStream) => {
   const serverSideLivestream = { ...serverSideStream };
   delete serverSideLivestream.registeredUsers;
   delete serverSideLivestream.registeredStudentsCount;
   delete serverSideLivestream.currentSpeakerId;
   delete serverSideLivestream.participatingStudents;
   delete serverSideLivestream.participatingStudentsCount;
   delete serverSideLivestream.talentPool;
   delete serverSideLivestream.targetGroups;
   delete serverSideLivestream.hasStarted;
   delete serverSideLivestream.hasSentEmails;
   delete serverSideLivestream.liveSpeakers;
   delete serverSideLivestream.hasEnded;
   delete serverSideLivestream.hidden;
   delete serverSideLivestream.test;
   delete serverSideLivestream.adminEmails;
   delete serverSideLivestream.adminEmail;
   delete serverSideLivestream.author;
   delete serverSideLivestream.lastUpdatedAuthorInfo;
   delete serverSideLivestream.status;

   serverSideLivestream.createdDateString =
      serverSideLivestream.created?.toDate?.().toString() || null;
   serverSideLivestream.lastUpdatedDateString =
      serverSideLivestream.lastUpdated?.toDate?.().toString() || null;
   serverSideLivestream.startDateString =
      serverSideLivestream.start?.toDate?.().toString() || null;

   // Clear out props that have methods of which the server can't parse
   delete serverSideLivestream.created;
   delete serverSideLivestream.lastUpdated;
   delete serverSideLivestream.start;

   return serverSideLivestream;
};

export const parseStreamDates = (stream) => {
   const newStream = { ...stream };
   if (newStream.createdDateString) {
      newStream.createdDate = new Date(Date.parse(newStream.createdDateString));
   }
   if (newStream.lastUpdatedDateString) {
      newStream.lastUpdatedDate = new Date(
         Date.parse(newStream.lastUpdatedDateString)
      );
   }
   if (newStream.startDateString) {
      newStream.startDate = new Date(Date.parse(newStream.startDateString));
   }
   return newStream;
};

export const convertStreamJsDatesToTimestamps = (
   stream,
   jsDateToTimestampCallback
) => {
   const newStream = { ...stream };
   if (newStream.createdDate) {
      newStream.created = jsDateToTimestampCallback(newStream.createdDate);
   }
   if (newStream.lastUpdatedDate) {
      newStream.lastUpdated = jsDateToTimestampCallback(
         newStream.lastUpdatedDate
      );
   }
   if (newStream.startDate) {
      newStream.start = jsDateToTimestampCallback(newStream.startDate);
   }
   return newStream;
};
export const getServerSideGroup = async (groupId) => {
   let serverSideGroup = {};
   const snap = await store.firestore.get({
      collection: "careerCenterData",
      doc: groupId,
      storeAs: `group ${groupId}`,
   });
   if (snap.exists) {
      serverSideGroup = snap.data();
      delete serverSideGroup.adminEmails;
      serverSideGroup.id = snap.id;
   }
   return serverSideGroup;
};
