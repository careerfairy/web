import {createSelector} from "reselect";
import {repositionElementInArray} from "../helperFunctions/HelperFunctions";

const upcomingLivestreamsSelector = createSelector(
    livestreams => livestreams,
    (_, {livestreamId}) => livestreamId,
    (livestreams, livestreamId) => {
        if (!livestreams) {
            return livestreams
        }
        let newLivestreams = [...livestreams]
        if (livestreamId) {
            const currentIndex = newLivestreams.findIndex(
                (el) => el.id === livestreamId
            );
            if (currentIndex > -1) {
                newLivestreams = repositionElementInArray(newLivestreams, currentIndex, 0)
            }
        }
        return newLivestreams.filter(livestream => !livestream.hidden);
    }
)

export default upcomingLivestreamsSelector