import { useState, useEffect, useCallback, useMemo } from "react"
import { usePrevious } from "react-use"
import { type OnProgressProps } from "react-player/base"

export type UseReactPlayerTrackerProps = {
   /**
    * Determines if the video should play.
    */
   shouldPlay: boolean
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
   shouldPlay,
   onSecondPass,
   onVideoEnd,
   identifier,
}: UseReactPlayerTrackerProps) => {
   const [secondsWatched, setSecondsWatched] = useState(0)

   const prevSecondsWatched = usePrevious(secondsWatched)

   const onProgress = useCallback((progress: OnProgressProps) => {
      setSecondsWatched(progress.playedSeconds)
   }, [])

   const prevIdentifier = usePrevious(identifier)

   useEffect(() => {
      if (identifier !== prevIdentifier) {
         setSecondsWatched(0)
      }
   }, [identifier, prevIdentifier])

   useEffect(() => {
      if (prevSecondsWatched === undefined) return

      // Check if a full second has passed
      if (Math.floor(secondsWatched) !== Math.floor(prevSecondsWatched)) {
         onSecondPass?.(secondsWatched)
      }

      // Check if the video has looped
      if (secondsWatched > 0 && secondsWatched < prevSecondsWatched) {
         onVideoEnd?.()
      }
   }, [secondsWatched, prevSecondsWatched, onSecondPass, onVideoEnd])

   return onProgress
}

export default useReactPlayerTracker
