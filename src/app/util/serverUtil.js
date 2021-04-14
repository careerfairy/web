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
            }
        }
    }
    return serverSideStream
}
export const getServerSideGroup = async (groupId) => {
    let serverSideGroup = {}
    const snap = await store.firestore.get({collection: "careerCenterData", doc: groupId, storeAs: `group ${groupId}`})
    if (snap.exists) {
        serverSideGroup = snap.data()
        serverSideGroup.id = snap.id;
    }
    return serverSideGroup
}

