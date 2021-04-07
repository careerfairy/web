import React from 'react';
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import nextLivestreamsSelector from "../selectors/nextLivestreamsSelector";

var fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;
const targetTime = new Date(Date.now() - fortyFiveMinutesInMilliseconds)
const useGroupUpcomingStreams = (livestreamId, groupId) => {

    useFirestoreConnect(() => [{
        collection: "livestreams",
        where: [["start", ">", targetTime], ["test", "==", false]],
        orderBy: ["start", "asc"],
        storeAs: `upcomingLivestreams of ${groupId}`
    }])

    return useSelector(state =>
        nextLivestreamsSelector(state.firestore.ordered[`upcomingLivestreams of ${groupId}`], {livestreamId})
    )
};

export default useGroupUpcomingStreams;
