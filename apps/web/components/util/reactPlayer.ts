import { type ReactPlayerProps } from "react-player"
import { type VimeoPlayerProps } from "react-player/vimeo"
import { type YouTubePlayerProps } from "react-player/youtube"
import { getQueryStringFromUrl } from "util/CommonUtil"
import { YOUTUBE_URL_REGEX } from "./constants"

const getYoutubeConfig = (
   isVideoSharer: boolean
): YouTubePlayerProps["config"] => {
   return {
      // https://developers.google.com/youtube/player_parameters
      playerVars: {
         controls: isVideoSharer ? 1 : 0,
         fs: 0,
         disablekb: isVideoSharer ? 0 : 1,
         rel: 0,
      },
   }
}

const getVimeoConfig = (isVideoSharer: boolean): VimeoPlayerProps["config"] => {
   return {
      playerOptions: {
         // https://developer.vimeo.com/api/oembed/videos
         controls: isVideoSharer ? true : false,
         fullscreen: false,
         keyboard: isVideoSharer ? true : false,
      },
   }
}

/**
 * Get the configuration for YouTube and Vimeo players.
 *
 * @param isVideoSharer - Indicates if the video sharer controls should be enabled.
 */
export const getConfig = (
   isVideoSharer: boolean
): ReactPlayerProps["config"] => {
   return {
      youtube: getYoutubeConfig(isVideoSharer),
      vimeo: getVimeoConfig(isVideoSharer),
   }
}

/**
 * Extracts the number of seconds passed from a YouTube URL.
 *
 * @param {string} url - The YouTube URL to extract the time from.
 * @returns {number} - The number of seconds passed in the video, or 0 if the URL is invalid or does not contain a time parameter.
 */
export const getSecondsPassedFromYoutubeUrl = (url: string): number => {
   if (!YOUTUBE_URL_REGEX.test(url)) {
      return 0
   }

   const secondsPassed = Number(getQueryStringFromUrl(url, "t"))

   return secondsPassed || 0
}
