import { useState, useEffect, useCallback } from "react"
import { usePrevious } from "react-use"
import { type OnProgressProps } from "react-player/base"

export type UseReactPlayerTrackerProps = {
   /**
    * Callback function that is called every time a full second has passed.
    * @param secondsWatched - The number of seconds watched.
    */
   onSecondPass?: (secondsWatched: number) => void
   /**
    * Callback function that is called when the video ends.
    */
   onVideoEnd?: () => void
   /**
    * Identifier for the video.
    */
   identifier: string
}

/**
 * Custom hook for tracking the number of seconds watched in a ReactPlayer component.
 *
 * @example
 * const onProgress = useReactPlayerTracker({
 *   shouldPlay: true,
 *   onSecondPass: (secondsWatched) => {
 *     console.log('A full second has passed:', secondsWatched);
 *   },
 *   onVideoEnd: () => {
 *     console.log('The video has ended');
 *   }
 * });
 *
 * <ReactPlayer url={videoUrl} onProgress={onProgress} />
 */
const useReactPlayerTracker = ({
   onSecondPass,
   onVideoEnd,
   identifier,
}: UseReactPlayerTrackerProps) => {
   const [secondsWatched, setSecondsWatched] = useState(0)
   const [hasEnded, setHasEnded] = useState(false)

   const prevSecondsWatched = usePrevious(secondsWatched)

   const onProgress = useCallback((progress: OnProgressProps) => {
      setSecondsWatched(progress.playedSeconds)
   }, [])

   const prevIdentifier = usePrevious(identifier)

   useEffect(() => {
      if (identifier !== prevIdentifier) {
         setSecondsWatched(0)
         setHasEnded(false) // Reset hasEnded when identifier changes
      }
   }, [identifier, prevIdentifier])

   useEffect(() => {
      if (prevSecondsWatched === undefined) return

      // Check if a full second has passed
      if (Math.floor(secondsWatched) !== Math.floor(prevSecondsWatched)) {
         onSecondPass?.(secondsWatched)
      }

      // Check if the video has looped
      if (
         !hasEnded &&
         secondsWatched > 0 &&
         secondsWatched < prevSecondsWatched
      ) {
         onVideoEnd?.()
         setHasEnded(true) // Set hasEnded to true when the video ends
      }
   }, [secondsWatched, prevSecondsWatched, onSecondPass, onVideoEnd, hasEnded])

   return onProgress
}

export default useReactPlayerTracker
