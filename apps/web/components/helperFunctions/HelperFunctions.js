import { isEmpty } from "lodash/fp"
import React from "react"
import { LONG_NUMBER } from "../util/constants"
import { v4 as uuidv4 } from "uuid"

var dayjs = require("dayjs")
var relativeTime = require("dayjs/plugin/relativeTime")
var localizedFormat = require("dayjs/plugin/localizedFormat")
var advancedFormat = require("dayjs/plugin/advancedFormat")
var utc = require("dayjs/plugin/utc") // dependent on utc plugin
var timezone = require("dayjs/plugin/timezone")
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
   location,
   fileObject,
   firebase,
   callback,
   progressCallback,
   errorCallback = undefined
) => {
   const storageRef = firebase.getStorageRef()
   let splitters = [" ", "(", ")", "-"]
   let fileName = fileObject.name
   let imageName = splitters
      .reduce((old, c) => old.map((v) => v.split(c)).flat(), [fileName])
      .join("_")
   if (imageName.length > 10) {
      imageName = imageName.slice(-10)
   }
   let fullPath = `${location}/${uuidv4()}_${imageName}`
   let companyLogoRef = storageRef.child(fullPath)
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

export function getTimeFromNow(firebaseTimestamp) {
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

export const prettyDate = (firebaseTimestamp) => {
   if (firebaseTimestamp && firebaseTimestamp.toDate?.()) {
      return dayjs(firebaseTimestamp.toDate()).format("LL LT")
   } else {
      return ""
   }
}
export const prettyLocalizedDate = (javascriptDate) => {
   if (javascriptDate) {
      return dayjs(javascriptDate).format("LL LT zzz")
   } else {
      return ""
   }
}

export const repositionElement = (arr, fromIndex, toIndex) => {
   const element = arr[fromIndex]
   arr.splice(fromIndex, 1)
   arr.splice(toIndex, 0, element)
}

export const repositionElementInArray = (arr, fromIndex, toIndex) => {
   const newArray = [...arr]
   const element = arr[fromIndex]
   newArray.splice(fromIndex, 1)
   newArray.splice(toIndex, 0, element)
   return newArray
}

export const getLength = (arr, prop) => {
   return arr.map((el) => {
      return el?.[prop]?.length || 0
   })
}

export const isEmptyObject = (obj) => {
   return isEmpty(obj)
}

export const isNotEmptyString = (myString) => {
   return myString && myString.match(/^\s+$/) === null
}

export const isServer = () => {
   return typeof window === "undefined"
}
export const convertCamelToSentence = (string) => {
   if (typeof string === "string" || string instanceof String) {
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
export const getServerSideRouterQuery = (queryKey, router) => {
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

export const snapShotsToData = (snapShots) => {
   let dataArray = []
   snapShots.forEach((doc) => {
      const data = doc.data()
      data.id = doc.id
      dataArray.push(data)
   })
   return dataArray
}

export const singleSnapToData = (snapShot) => {
   let data = {}
   if (snapShot.exists) {
      data = snapShot.data()
      data.id = snapShot.id
   }
   return data
}

export const MultilineText = ({ text }) => {
   return text.split("\\n").map((item, i) => <p key={i}>{item}</p>)
}

export const copyStringToClipboard = (string) => {
   try {
      navigator.clipboard.writeText(string)
   } catch (e) {
      // overlay browsers (e.g instagram) don't seem to allow this
      // The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
      //https://sentry.io/organizations/careerfairy/issues/3713073375
      console.error(e)
   }
}

export const mustBeNumber = (value, decimals = 2) => {
   function round(value, decimals) {
      return Number(Math.round(value + "e" + decimals) + "e-" + decimals)
   }

   // checks to see if value is an int or float, if not it will return zero
   return Number.isFinite(value) ? round(value, decimals) : 0
}

export const convertStringToArray = (string, maxChars = 30) => {
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

export const mergeArrayOfObjects = (arr1, arr2, property) => {
   let merged = []
   for (let i = 0; i < arr1.length; i++) {
      merged.push({
         ...arr1[i],
         ...arr2.find((itmInner) => itmInner[property] === arr1[i][property]),
      })
   }
   return merged
}

export const getMinutes = (value) =>
   value === LONG_NUMBER ? "stream Ends" : `${value} minutes`

export const dynamicSort = (property, reverse) => {
   let sortOrder = reverse ? 1 : -1
   if (property[0] === "-") {
      sortOrder = -1
      property = property.substr(1)
   }
   return function (a, b) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      const result =
         a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0
      return result * sortOrder
   }
}
export const truncate = (str, n) => {
   return str.length > n ? str.substr(0, n - 1) + "..." : str
}

export const getBaseUrl = () => {
   let baseUrl = "https://careerfairy.io"
   if (typeof window === "undefined") return baseUrl
   return window?.location?.origin
}

export const maybePluralize = (count, noun, suffix = "s") =>
   `${noun}${count !== 1 ? suffix : ""}`

export const getMinutesPassed = (livestream) => {
   const now = new Date()
   if (livestream?.start?.toDate()) {
      const diff = Math.abs(now - livestream.start.toDate())
      return Math.floor(diff / 1000 / 60)
   } else {
      return null
   }
}

export const addMinutes = (date, minutes) => {
   return new Date(date.getTime() + minutes * 60000)
}

export const toTitleCase = (str) => {
   return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
   })
}

export const makeExternalLink = (url) => {
   const urlPattern = new RegExp(
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
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

export const getRandomColor = () => {
   const max = 0xffffff
   return "#" + Math.round(Math.random() * max).toString(16)
}

export const getRandomInt = (min, max) => {
   min = Math.ceil(min)
   max = Math.floor(max)
   return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomWeightedInt = (min, max, index) => {
   return Math.floor((Math.random() * (max - min + 1) + min) / (index + 1))
}

/**
 * Get Resized Url.
 * @param {string} url – original url of image
 * @param {('xs'|'sm'|'md'|'lg')} size – size of the image
 * @return {string} Returns the image url with the correct size appended to it.
 */
export const getResizedUrl = (url, size = "sm") => {
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
 * @param {string} url – original url of image
 * @param {boolean} isMobile – size of the image
 * @param {('xs'|'sm'|'md'|'lg')} mobileSize – size of the image on when mobile
 * @param {('xs'|'sm'|'md'|'lg')} desktopSize – size of the image on desktop
 * @return {string} Returns the image url with the correct size appended to it.
 */

export const getResponsiveResizedUrl = (
   url,
   isMobile,
   mobileSize = "sm",
   desktopSize = "lg"
) => {
   return getResizedUrl(url, isMobile ? mobileSize : desktopSize)
}

export const addQueryParam = (url, queryParam) => {
   if (!queryParam) return url
   if (url.includes("?")) {
      return `${url}&${queryParam}`
   }
   return `${url}?${queryParam}`
}

export const addMinutesToDate = (date, minutes) => {
   const newDate = new Date(date)
   return new Date(newDate.getTime() + minutes * 60000)
}

export const shuffleArray = (array) =>
   array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

export const dataURLtoFile = (dataUrl, filename) => {
   let arr = dataUrl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)

   while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
   }
   const extension = mime.split("/")[1]
   return new File([u8arr], `${filename}.${extension}`, {
      type: mime,
   })
}

export const getMaxLineStyles = (maxLines = 2) => ({
   display: "-webkit-box",
   lineClamp: maxLines,
   WebkitLineClamp: maxLines,
   overflow: "hidden",
   textOverflow: "ellipsis",
   WebkitBoxOrient: "vertical",
})

export const sleep = (ms) => {
   return new Promise((resolve) => setTimeout(resolve, ms))
}

export const delay = (t) => new Promise((resolve) => setTimeout(resolve, t))
