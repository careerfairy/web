import {createSelector} from 'reselect';
import {populate} from "react-redux-firebase";

const populates = [{child: 'groupIds', root: 'careerCenterData', childAlias: 'careerCenters'}]

const currentLivestreamSelector = createSelector(
    state => populate(state.firestore, "currentLivestream", populates),
    (_, {streamId}) => streamId,
    (currentLivestream, streamId) => {
        if (!currentLivestream) return currentLivestream
        if (!currentLivestream.id) {
            currentLivestream.id = streamId
        }
        return currentLivestream
    }
)
export default currentLivestreamSelector