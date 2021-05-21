import {createSelector} from "reselect";
import {dynamicSort, repositionElementInArray} from "../helperFunctions/HelperFunctions";

const upcomingLivestreamsSelector = createSelector(
    livestreams => livestreams,
    (_, {livestreamId}) => livestreamId,
    (_, {registeredStudentsCount}) => registeredStudentsCount,
    (livestreams, livestreamId, registeredStudentsCount) => {
        if (!livestreams) {
            return livestreams
        }
        let newLivestreams = registeredStudentsCount ? [...livestreams].sort(dynamicSort("registeredStudentsCount")) : [...livestreams]
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