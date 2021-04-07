import React from 'react';
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import groupUpcomingLivestreamsSelector from "../selectors/groupUpcomingLivestreamsSelector";

var fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;
const targetTime = new Date(Date.now() - fortyFiveMinutesInMilliseconds)

const useGroupUpcomingStreams = (livestreamId, groupId, selectedOptions) => {

    useFirestoreConnect(() => [{
        collection: "livestreams",
        where: [["groupIds", "array-contains", groupId],["start", ">", targetTime], ["test", "==", false]],
        orderBy: ["start", "asc"],
        storeAs: `upcomingLivestreams of ${groupId}`
    }])

    return useSelector(state =>
        groupUpcomingLivestreamsSelector(state.firestore.ordered[`upcomingLivestreams of ${groupId}`], {livestreamId, groupId, selectedOptions})
    )
};

export default useGroupUpcomingStreams;
