import { useState, useEffect, useCallback } from "react"
import { usePrevious } from "react-use"
import { type OnProgressProps } from "react-player/base"

type UseReactPlaySecondWatcher = {
   onProgress: (progress: OnProgressProps) => void
   secondsWatched: number
}

/**
 * Custom hook that tracks the number of seconds watched in a ReactPlayer component.
 *
 * @param {function} onSecondPass - Callback function that is called every time a full second has passed.
 * @returns {object} An object containing:
 * - `onProgress`: A function to be passed to the `onProgress` prop of the ReactPlayer component.
 * - `secondsWatched`: The total number of seconds that have been watched.
 *
 * @example
 * const { onProgress, secondsWatched } = useReactPlayerSecondWatcher((secondsWatched) => {
 *   console.log('A full second has passed:', secondsWatched);
 * });
 *
 * <ReactPlayer url={videoUrl} onProgress={onProgress} />
 */
const useReactPlayerSecondWatcher = (
   onSecondPass: (secondsWatched: number) => void
): UseReactPlaySecondWatcher => {
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
   }, [secondsWatched, prevSecondsWatched, onSecondPass])

   return { onProgress, secondsWatched }
}

export default useReactPlayerSecondWatcher
