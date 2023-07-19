/**
 * Function to get the duration of a video file.
 * It creates an HTMLVideoElement, sets the source to the provided File object,
 * and listens to the 'loadedmetadata' event to capture the duration of the video.
 *
 * @param {File} file - A File object representing a video file.
 * @returns {Promise<number>} - A Promise that resolves with the duration of the video in seconds.
 * @throws Will throw an error if the video metadata fails to load.
 */
export const getVideoFileDuration = (file: File): Promise<number> => {
   return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadeddata = function () {
         window.URL.revokeObjectURL(video.src)
         if (video.duration === Infinity) {
            // In some cases, the browser might report the duration as Infinity for formats like webm,
            // so we seek to the end of the video to get its actual duration.
            video.currentTime = Number.MAX_SAFE_INTEGER
            video.ontimeupdate = function () {
               video.ontimeupdate = null // Prevent multiple invocations
               resolve(video.duration)
               video.currentTime = 0
            }
         } else {
            resolve(video.duration)
         }
      }
      video.onerror = function () {
         reject("Invalid video. Please select a video file.")
      }
      video.src = URL.createObjectURL(file)
   })
}
