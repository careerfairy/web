import { TransitionGroup } from "react-transition-group"
import { useEmotes } from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../../context"
import { AnimatedEmote } from "./AnimatedEmote"
import { useFallbackTrackEmotes } from "./useFallbackTrackEmotes"
import { useTrackEmotes } from "./useTrackEmotes"

export const EmotesRenderer = () => {
   const { livestreamId, agoraUserId } = useStreamingContext()

   useTrackEmotes()
   useFallbackTrackEmotes(livestreamId, agoraUserId)

   const emotes = useEmotes()

   if (!emotes.length) return null

   return (
      <TransitionGroup>
         {emotes.map((emote) => (
            <AnimatedEmote key={emote.id} emote={emote} />
         ))}
      </TransitionGroup>
   )
}
