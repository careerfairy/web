import { useState, useEffect, useCallback, useMemo } from "react"
import { usePrevious } from "react-use"
import { type OnProgressProps } from "react-player/base"

/**
 * Custom hook for tracking the number of seconds watched in a ReactPlayer component.
 *
 * @param {boolean} shouldPlay - Determines if the video should play.
 * @param {function} onSecondPass - Callback function that is called every time a full second has passed.
 * @param {function} onVideoEnd - Callback function that is called when the video ends.
 * @returns {function} A function to be passed to the `onProgress` prop of the ReactPlayer component.
 *
 * @example
 * const onProgress = useReactPlayerTracker(true, (secondsWatched) => {
 *   console.log('A full second has passed:', secondsWatched);
 * },
 * () => {
 *   console.log('The video has ended');
 * });
 *
 * <ReactPlayer url={videoUrl} onProgress={onProgress} />
 */
const useReactPlayerTracker = (
   shouldPLay: boolean,
   onSecondPass?: (secondsWatched: number) => void,
   onVideoEnd?: () => void
) => {
   const [secondsWatched, setSecondsWatched] = useState(0)

   const prevSecondsWatched = usePrevious(secondsWatched)

   const onProgress = useCallback((progress: OnProgressProps) => {
      setSecondsWatched(progress.playedSeconds)
   }, [])

   useEffect(() => {
      if (prevSecondsWatched === undefined) return

      if (Math.floor(secondsWatched) !== Math.floor(prevSecondsWatched)) {
         onSecondPass(secondsWatched)
      }

      // Check if the video has looped
      if (secondsWatched > 0 && secondsWatched < prevSecondsWatched) {
         onVideoEnd?.()
      }
   }, [secondsWatched, prevSecondsWatched, onSecondPass, onVideoEnd])

   useEffect(() => {
      if (!shouldPLay) {
         setSecondsWatched(0)
      }
   }, [shouldPLay])

   return onProgress
}

export default useReactPlayerTracker
