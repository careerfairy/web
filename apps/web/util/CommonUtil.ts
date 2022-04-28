import LocalStorageUtil from "./LocalStorageUtil"

export function getRandom(arr, n) {
   var result = new Array(n),
      len = arr.length,
      taken = new Array(len)
   if (n > len) return arr
   while (n--) {
      var x = Math.floor(Math.random() * len)
      result[n] = arr[x in taken ? taken[x] : x]
      taken[x] = --len in taken ? taken[len] : len
   }
   return result
}

export function getMaxSlides(intendedSlidesToShow, numberOfElements) {
   if (intendedSlidesToShow > numberOfElements) {
      return numberOfElements
   } else {
      return intendedSlidesToShow
   }
}

/**
 * @param {number|string|VarDate|Date} streamStartDate -  Date
 * @param {number} minimumTimeElapsed - Minimum time (minutes) that must have passed since the start of the stream
 */
export function streamIsOld(streamStartDate, minimumTimeElapsed = 120) {
   if (!streamStartDate) return false

   let streamDate
   if (typeof streamStartDate.toDate === "function") {
      streamDate = streamStartDate.toDate() // firestore timestamp conversion
   } else {
      streamDate = new Date(streamStartDate)
   }

   const now = new Date()
   // @ts-ignore
   const timeElapsed = now - streamDate
   return timeElapsed > minimumTimeElapsed * 60 * 1000
}

/**
 * @param {Date} date - input date
 */
export function dateIsInUnder24Hours(date) {
   return (
      new Date(date).getTime() - Date.now() < 1000 * 60 * 60 * 24 ||
      Date.now() > new Date(date).getTime()
   )
}

/**
 * Get referralCode and livestreamId invitation from localstorage
 */
export function getReferralInformation() {
   try {
      if (typeof window !== "undefined") {
         return {
            referralCode: LocalStorageUtil.getReferralCode(),
            inviteLivestream: LocalStorageUtil.getInviteLivestream(),
         }
      }
   } catch (e) {
      console.error(e)
      return null
   }

   return null
}

/**
 * Get list separator character from OS Regional Settings
 *
 * Useful to generate csv files
 * @returns {string}
 */
export function getListSeparator() {
   let list = ["a", "b"],
      str
   if (list.toLocaleString) {
      str = list.toLocaleString()
      if (str.indexOf(";") > 0 && str.indexOf(",") === -1) {
         return ";"
      }
   }
   return ","
}

export const getQueryStringFromUrl = (url = "", queryParam = "") => {
   let params = new URL(url).searchParams
   return params.get(queryParam)
}

export function stringToColor(string: string) {
   let hash = 0
   let i

   /* eslint-disable no-bitwise */
   for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash)
   }

   let color = "#"

   for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff
      color += `00${value.toString(16)}`.slice(-2)
   }
   /* eslint-enable no-bitwise */

   return color
}

export function stringAvatar(name: string) {
   const cleanedName = name.split("undefined").join("")
   const initials = `${cleanedName.split(" ")[0][0] || ""}${
      cleanedName.split(" ")[1][0] || ""
   }`
   return {
      sx: {
         bgcolor: stringToColor(cleanedName),
      },
      children: initials || "A",
   }
}
