import React from 'react';
import {useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import upcomingLivestreamsSelector from "../selectors/upcomingLivestreamsSelector";
import {
    FORTY_FIVE_MINUTES_IN_MILLISECONDS,
    PAST_LIVESTREAMS_NAME,
    START_DATE_FOR_REPORTED_EVENTS
} from "../../data/constants/streamContants";


const {fourWeeks, twoMonths, fourMonths, sixMonths, eightMonths} = {
    fourWeeks: new Date().setDate(new Date().getDate() - 28),
    twoMonths: new Date().setMonth(new Date().getMonth() - 2),
    fourMonths: new Date().setMonth(new Date().getMonth() - 4),
    eightMonths: new Date().setMonth(new Date().getMonth() - 8),
    sixMonths: new Date().setMonth(new Date().getMonth() - 6),
}
const earliestTime = new Date(twoMonths)
const currentTime = new Date(Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS)
const pastLivestreamsQuery = [["start", "<", currentTime], ["start", ">", earliestTime], ["test", "==", false]]
const usePastStreams = (livestreamId) => {

    useFirestoreConnect(() => [{
        collection: "livestreams",
        where: pastLivestreamsQuery,
        orderBy: ["start", "desc"],
        storeAs: PAST_LIVESTREAMS_NAME
    }])

    return useSelector(state =>
        upcomingLivestreamsSelector(state.firestore.ordered[PAST_LIVESTREAMS_NAME], {livestreamId, registeredStudentsCount: true})
    )
};

export default usePastStreams;
