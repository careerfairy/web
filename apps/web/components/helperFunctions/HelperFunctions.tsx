/* eslint-disable @typescript-eslint/no-var-requires */
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { mainProductionDomainWithProtocol } from "@careerfairy/shared-lib/utils/urls"
import { NextRouter } from "next/router"
import { v4 as uuidv4 } from "uuid"
import { LONG_NUMBER } from "../util/constants"

import { Timestamp } from "@careerfairy/shared-lib/firebaseTypes"
import FirebaseService from "data/firebase/FirebaseService"
import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import localizedFormat from "dayjs/plugin/localizedFormat"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc" // dependent on utc plugin

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(advancedFormat)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

/**
 * @param {string} location
 * @param {*} fileObject
 * @param {FirebaseService} firebase
 * @param {function} callback
 * @param {function} progressCallback
 * @param errorCallback
 */
export const uploadLogo = (
   location: string,
   fileObject: File,
   firebase: FirebaseService,
   callback: (downloadURL: string, fullPath: string) => void,
   progressCallback: (progress: { state: string; progress: number }) => void,
   errorCallback: (error: Error) => void = undefined
) => {
   const storageRef = firebase.getStorageRef()
   const splitters = [" ", "(", ")", "-"]
   const fileName = fileObject.name
   let imageName = splitters
      .reduce((old, c) => old.map((v) => v.split(c)).flat(), [fileName])
      .join("_")
   if (imageName.length > 10) {
      imageName = imageName.slice(-10)
   }
   const fullPath = `${location}/${uuidv4()}_${imageName}`
   const companyLogoRef = storageRef.child(fullPath)
   const uploadTask = companyLogoRef.put(fileObject)

   uploadTask.on(
      "state_changed",
      function (snapshot) {
         const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
         console.log("Upload is " + progress + "% done")
         if (progressCallback) {
            progressCallback({
               state: snapshot.state,
               progress,
            })
         }
         switch (snapshot.state) {
            case "paused":
               console.log("Upload is paused")
               break
            case "running":
               console.log("Upload is running")
               break
            default:
               break
         }
      },
      function (error) {
         if (errorCallback) {
            errorCallback(error)
         }
         switch (error.code) {
            case "storage/unauthorized":
               // User doesn't have permission to access the object
               break

            case "storage/canceled":
               // User canceled the upload
               break

            case "storage/unknown":
               // Unknown error occurred, inspect error.serverResponse
               break
            default:
               break
         }
      },
      function () {
         // Upload completed successfully, now we can get the download URL
         uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log("-> downloadURL", downloadURL)
            callback(downloadURL, fullPath)
            console.log("File available at", downloadURL)
         })
      }
   )
}

export const timeAgo = (date = new Date()) => {
   return dayjs(date).fromNow()
}

export function getTimeFromNow(firebaseTimestamp: Timestamp | null) {
   if (firebaseTimestamp) {
      const dateString = dayjs(firebaseTimestamp.toDate()).fromNow()
      if (dateString === "in a few seconds") {
         return "just now"
      } else {
         return dateString
      }
   } else {
      return ""
   }
}

export const prettyDate = (firebaseTimestamp: Timestamp | null) => {
   if (firebaseTimestamp && firebaseTimestamp.toDate?.()) {
      return dayjs(firebaseTimestamp.toDate()).format("LL LT")
   } else {
      return ""
   }
}
export const prettyLocalizedDate = (javascriptDate: Date | null) => {
   if (javascriptDate) {
      return dayjs(javascriptDate).format("LL LT zzz")
   } else {
      return ""
   }
}

export const repositionElement = (
   arr: any[],
   fromIndex: number,
   toIndex: number
) => {
   const element = arr[fromIndex]
   arr.splice(fromIndex, 1)
   arr.splice(toIndex, 0, element)
}

export const repositionElementInArray = (
   arr: any[],
   fromIndex: number,
   toIndex: number
) => {
   const newArray = [...arr]
   const element = arr[fromIndex]
   newArray.splice(fromIndex, 1)
   newArray.splice(toIndex, 0, element)
   return newArray
}

export const isServer = () => {
   return typeof window === "undefined"
}

export const isInIframe = () => {
   if (isServer()) {
      return false
   }

   try {
      return window.self !== window.top
   } catch (e) {
      return true
   }
}

export const convertCamelToSentence = (string: string) => {
   if (typeof string === "string") {
      return (
         string
            .replace(/([A-Z])/g, " $1")
            .charAt(0)
            .toUpperCase() + string.replace(/([A-Z])/g, " $1").slice(1)
      )
   } else {
      return ""
   }
}

export const getServerSideRouterQuery = (
   queryKey: string,
   router: NextRouter
) => {
   if (router.query[queryKey]) {
      return router.query[queryKey]
   } else {
      const query = router.asPath.match(new RegExp(`[&?]${queryKey}=(.*)(&|$)`))
      if (query) {
         return query[1]
      } else {
         return null
      }
   }
}

export const copyStringToClipboard = (string: string) => {
   try {
      navigator.clipboard.writeText(string)
   } catch (e) {
      // overlay browsers (e.g instagram) don't seem to allow this
      // The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
      //https://sentry.io/organizations/careerfairy/issues/3713073375
      console.error(e)
   }
}

export const convertStringToArray = (string: string, maxChars = 30) => {
   // Split by spaces
   return (
      string
         .split(/\s+/)

         // Then join words so that each string section is less then 40
         .reduce(function (prev, curr) {
            if (
               prev.length &&
               (prev[prev.length - 1] + " " + curr).length <= maxChars
            ) {
               prev[prev.length - 1] += " " + curr
            } else {
               prev.push(curr)
            }
            return prev
         }, [])
         .map((str) => str)
   )
}

export const getMinutes = (value: number) =>
   value === LONG_NUMBER ? "stream Ends" : `${value} minutes`

export const dynamicSort = (property: string, reverse: boolean) => {
   let sortOrder = reverse ? 1 : -1
   if (property[0] === "-") {
      sortOrder = -1
      property = property.substr(1)
   }
   return function (a: Record<string, unknown>, b: Record<string, unknown>) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      const result =
         a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0
      return result * sortOrder
   }
}

/**
 * Get the base url of the current environment.
 * @returns The base url of the current environment.
 * Examples:
 *
 * • https://careerfairy.io - production
 *
 * • https://staging.careerfairy.io - staging
 *
 * • https://careerfairy-ssr-webapp-pr-{number}.vercel.app - Vercel Preview
 *
 * • http://localhost:3000 - development
 */
export const getBaseUrl = () => {
   if (typeof window !== "undefined") {
      return window.location.origin
   }
   return process.env.NEXT_PUBLIC_URL || mainProductionDomainWithProtocol
}

export const maybePluralize = (count: number, noun: string, suffix = "s") =>
   `${noun}${count !== 1 ? suffix : ""}`

export const getMinutesPassed = (
   livestream: Pick<LivestreamEvent, "start">
) => {
   const now = new Date()
   if (livestream?.start?.toDate()) {
      const diff = Math.abs(now.getTime() - livestream.start.toDate().getTime())
      return Math.floor(diff / 1000 / 60)
   } else {
      return null
   }
}

export const addMinutes = (date: Date, minutes: number) => {
   return new Date(date.getTime() + minutes * 60000)
}

export const makeExternalLink = (url: string) => {
   const urlPattern = new RegExp(
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w-._~:/?#[\]@!$&'(),;=.]+$/
   )
   let string = url

   if (urlPattern.test(string)) {
      //string is url

      ///clear http && https from string
      string = string.replace("https://", "").replace("http://", "")

      //add https to string
      string = `https://${string}`
   }
   return string
}

export const getRandomInt = (min: number, max: number) => {
   min = Math.ceil(min)
   max = Math.floor(max)
   return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomWeightedInt = (
   min: number,
   max: number,
   index: number
) => {
   return Math.floor((Math.random() * (max - min + 1) + min) / (index + 1))
}

/**
 * Get Resized Url.
 * @param url original url of image
 * @param size size of the image
 * @return Returns the image url with the correct size appended to it.
 */
export const getResizedUrl = (
   url: string,
   size: "xs" | "sm" | "md" | "lg" = "sm"
) => {
   const imageSizes = {
      xs: "200x200",
      sm: "400x400",
      md: "680x680",
      lg: "1200x900",
   }

   if (typeof url === "undefined") {
      return ""
   }
   if (typeof url !== "string") {
      console.warn("Invalid url provided to getResizedUrl helper fn")
      return ""
   }

   // don't transform the url if it's not a firebase storage url
   if (url.indexOf("firebasestorage") === -1) return url

   const targetSize = imageSizes[size]

   if (!targetSize) {
      console.warn("provided wrong size, must be one of [xs, sm, md, lg]")
      return url
   }

   // check if the url path has a file extension using URL
   const parsedUrl = new URL(url)
   const lastPathSegment = parsedUrl.pathname.split("/").pop()

   if (lastPathSegment.indexOf(".") === -1) {
      // no file extension, append the target size to the path
      const newPath = `${parsedUrl.pathname}_${targetSize}`
      return `${parsedUrl.origin}${newPath}${parsedUrl.search}`
   }

   return url.replace(/.(?=[^.]*$)/, `_${targetSize}.`)
}

/**
 * Get Responsive Resized Url.
 * @param url – original url of image
 * @param isMobile – size of the image
 * @param mobileSize – size of the image on when mobile
 * @param desktopSize – size of the image on desktop
 * @return Returns the image url with the correct size appended to it.
 */

export const getResponsiveResizedUrl = (
   url: string,
   isMobile: boolean,
   mobileSize: "xs" | "sm" | "md" | "lg" = "sm",
   desktopSize: "xs" | "sm" | "md" | "lg" = "lg"
) => {
   return getResizedUrl(url, isMobile ? mobileSize : desktopSize)
}

export const addQueryParam = (url: string, queryParam: string) => {
   if (!queryParam) return url
   if (url.includes("?")) {
      return `${url}&${queryParam}`
   }
   return `${url}?${queryParam}`
}

export const addMinutesToDate = (date: Date, minutes: number) => {
   const newDate = new Date(date)
   return new Date(newDate.getTime() + minutes * 60000)
}

export const shuffleArray = <T extends Array<unknown>>(array: T) =>
   array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

export const dataURLtoFile = (
   dataUrl: string,
   filename = new Date().getTime().toString()
) => {
   const arr = dataUrl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1])

   let n = bstr.length
   const u8arr = new Uint8Array(n)

   while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
   }
   const extension = mime.split("/")[1]
   return new File([u8arr], `${filename}.${extension}`, {
      type: mime,
   })
}

export const getMaxLineStyles = (maxLines = 2) =>
   ({
      display: "-webkit-box",
      lineClamp: maxLines,
      WebkitLineClamp: maxLines,
      overflow: "hidden",
      textOverflow: "ellipsis",
      WebkitBoxOrient: "vertical",
   } as const)

export const sleep = (ms: number) => {
   return new Promise((resolve) => setTimeout(resolve, ms))
}
