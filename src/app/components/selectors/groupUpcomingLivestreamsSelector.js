import {createSelector} from "reselect";
import {repositionElementInArray, repositionStream} from "../helperFunctions/HelperFunctions";

const checkIfLivestreamHasAll = (selected, arr) => {
    return selected.some((v) => arr.includes(v)); // switch to selected.includes to make it an AND Operator
};
const groupUpcomingLivestreamsSelector = createSelector(
    livestreams => livestreams,
    (_, {livestreamId}) => livestreamId,
    (_, {selectedOptions}) => selectedOptions,
    (_, {groupId}) => groupId,
    (livestreams, livestreamId, selectedOptions, groupId) => {
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
        return newLivestreams.reduce((accumulator, currentLivestream) => {
            if (currentLivestream.targetCategories) {
                const livestreamCategories =
                    currentLivestream.targetCategories[groupId];
                if (selectedOptions.length && livestreamCategories) {
                    if (
                        checkIfLivestreamHasAll(selectedOptions, livestreamCategories)
                    ) {
                        return accumulator.concat(currentLivestream);
                    }
                } else if (!selectedOptions.length) {
                    return accumulator.concat(currentLivestream);
                }
            } else {
                return accumulator.concat(currentLivestream);
            }
            return accumulator
        }, []);
    }
)

export default groupUpcomingLivestreamsSelector