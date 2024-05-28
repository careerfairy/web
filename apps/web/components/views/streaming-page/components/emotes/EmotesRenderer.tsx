import { TransitionGroup } from "react-transition-group"
import { useEmotes } from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../../context"
import { AnimatedEmote } from "./AnimatedEmote"
import { useFallbackTrackEmotes } from "./useFallbackTrackEmotes"

export const EmotesRenderer = () => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const emotes = useEmotes()

   useFallbackTrackEmotes(livestreamId, agoraUserId)

   if (!emotes.length) return null

   return (
      <TransitionGroup>
         {emotes.map((emote) => (
            <AnimatedEmote key={emote.id} emote={emote} />
         ))}
      </TransitionGroup>
   )
}
