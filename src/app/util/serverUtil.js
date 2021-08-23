import {store} from "../pages/_app";

export const getServerSideStream = async (livestreamId) => {
    let serverSideStream = null
    if (livestreamId) {
        const livestreamSnap = await store.firestore.get({collection: "livestreams", doc: livestreamId})
        if (livestreamSnap.exists) {
            const streamData = livestreamSnap.data()
            serverSideStream = {
                id: livestreamSnap.id,
                company: streamData.company,
                title: streamData.title,
                companyLogoUrl: streamData.companyLogoUrl,
                backgroundImageUrl: streamData.backgroundImageUrl,
                summary: streamData.summary,
            }
        }
    }
    return serverSideStream
}

export const serializeServerSideStream = (serverSideStream) => {
    const serverSideLivestream = {...serverSideStream}
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

    return serverSideLivestream
}

export const parseStreamDates = (stream) => {
    if (stream.createdDateString) {
        stream.createdDate = new Date(Date.parse(stream.createdDateString));
    }
    if (stream.lastUpdatedDateString) {
        stream.lastUpdatedDate = new Date(
          Date.parse(stream.lastUpdatedDateString)
        );
    }
    if (stream.startDateString) {
        stream.startDate = new Date(Date.parse(stream.startDateString));
    }
    return stream;
};
export const getServerSideGroup = async (groupId) => {
    let serverSideGroup = {}
    const snap = await store.firestore.get({collection: "careerCenterData", doc: groupId, storeAs: `group ${groupId}`})
    if (snap.exists) {
        serverSideGroup = snap.data()
        delete serverSideGroup.adminEmails
        serverSideGroup.id = snap.id;
    }
    return serverSideGroup
}

