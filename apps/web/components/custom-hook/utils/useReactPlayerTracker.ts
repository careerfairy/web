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
}: UseReactPlayerTrackerProps) => {
   const [secondsWatched, setSecondsWatched] = useState(0)

   const prevSecondsWatched = usePrevious(secondsWatched)

   const onProgress = useCallback((progress: OnProgressProps) => {
      setSecondsWatched(progress.playedSeconds)
   }, [])

   useEffect(() => {
      if (prevSecondsWatched === undefined) return

      // Check if a full second has passed
      if (Math.floor(secondsWatched) !== Math.floor(prevSecondsWatched)) {
         onSecondPass(secondsWatched)
      }

      // Check if the video has looped
      if (secondsWatched > 0 && secondsWatched < prevSecondsWatched) {
         onVideoEnd?.()
      }
   }, [secondsWatched, prevSecondsWatched, onSecondPass, onVideoEnd])

   useEffect(() => {
      if (!shouldPlay) {
         setSecondsWatched(0)
      }
   }, [shouldPlay])

   return onProgress
}

export default useReactPlayerTracker
