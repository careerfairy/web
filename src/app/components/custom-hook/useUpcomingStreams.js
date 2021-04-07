import React from 'react';
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import upcomingLivestreamsSelector from "../selectors/upcomingLivestreamsSelector";

var fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;
const targetTime = new Date(Date.now() - fortyFiveMinutesInMilliseconds)

const useUpcomingStreams = (livestreamId) => {

    useFirestoreConnect(() => [{
        collection: "livestreams",
        where: [["start", ">", targetTime], ["test", "==", false]],
        orderBy: ["start", "asc"],
        storeAs: "upcomingLivestreams"
    }])

    return useSelector(state =>
        upcomingLivestreamsSelector(state.firestore.ordered["upcomingLivestreams"], {livestreamId})
    )
};

export default useUpcomingStreams;
