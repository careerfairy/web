import { createSelector } from "reselect"

const currentLivestreamSelector = createSelector(
   (state) => state.firestore.data.currentLivestream,
   (_, { streamId }) => streamId,
   (stream, streamId) => {
      if (!stream) return stream
      let currentLivestream = { ...stream }
      if (!stream.id) {
         currentLivestream.id = streamId
      }
      return currentLivestream
   }
)
export default currentLivestreamSelector
