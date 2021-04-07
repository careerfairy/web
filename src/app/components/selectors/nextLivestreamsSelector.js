import {createSelector} from "reselect";
import {repositionStream} from "../helperFunctions/HelperFunctions";

const nextLivestreamsSelector = createSelector(
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
                newLivestreams = repositionStream(newLivestreams, currentIndex, 0)
            }
        }
        return newLivestreams.filter(livestream => !livestream.hidden);
    }
)

export default nextLivestreamsSelector