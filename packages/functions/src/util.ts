import { DateTime } from "luxon"
import { customAlphabet } from "nanoid"
import functions = require("firebase-functions")
import { https } from "firebase-functions"

export const setHeaders = (req, res) => {
   res.set("Access-Control-Allow-Origin", "*")
   res.set("Access-Control-Allow-Credentials", "true")

   if (req.method === "OPTIONS") {
      // Send response to OPTIONS requests
      res.set("Access-Control-Allow-Methods", "GET")
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      res.set("Access-Control-Max-Age", "3600")
      return res.status(204).send("")
   }
}

export const getStreamLink = (streamId) => {
   return "https://www.careerfairy.io/upcoming-livestream/" + streamId
}

export const getLivestreamTimeInterval = (
   livestreamStartDateTime,
   livestreamTimeZone
) => {
   const startDateTime = DateTime.fromJSDate(livestreamStartDateTime.toDate(), {
      zone: livestreamTimeZone,
   }).toFormat("HH:mm ZZZZ", { locale: "en-GB" })
   return `(${startDateTime})`
}

export const generateEmailData = (
   livestreamId,
   livestream,
   startingNow,
   timeToDelivery
) => {
   const recipientEmails = livestream.registeredUsers.join()
   const luxonStartDateTime = DateTime.fromJSDate(livestream.start.toDate(), {
      zone: livestream.timezone || "Europe/Zurich",
   })
   const mailgunVariables = {
      company: livestream.company,
      startTime: luxonStartDateTime.toFormat("HH:mm ZZZZ", { locale: "en-GB" }),
      companyLogo: livestream.companyLogoUrl,
      streamTitle: livestream.title,
      backgroundImage: livestream.backgroundImageUrl,
      streamLink: livestream.externalEventLink
         ? livestream.externalEventLink
         : getStreamLink(livestreamId),
      german: livestream.language === "DE",
   }
   const recipientVariablesObj = {}
   livestream.registeredUsers.forEach((email) => {
      recipientVariablesObj[email] = mailgunVariables
   })
   if (startingNow) {
      return {
         from: "CareerFairy <noreply@careerfairy.io>",
         to: recipientEmails,
         subject:
            "NOW: Live Stream with " +
            livestream.company +
            " " +
            getLivestreamTimeInterval(
               livestream.start,
               livestream.timezone || "Europe/Zurich"
            ),
         template: "registration-reminder",
         "recipient-variables": JSON.stringify(recipientVariablesObj),
      }
   } else {
      return {
         from: "CareerFairy <noreply@careerfairy.io>",
         to: recipientEmails,
         subject:
            "Reminder: Live Stream with " +
            livestream.company +
            " " +
            getLivestreamTimeInterval(
               livestream.start,
               livestream.timezone || "Europe/Zurich"
            ),
         template: "registrationreminder-2021-10-24.070709",
         "recipient-variables": JSON.stringify(recipientVariablesObj),
         "o:deliverytime": luxonStartDateTime
            .minus({ minutes: timeToDelivery })
            .toRFC2822(),
      }
   }
}

export const getArrayDifference = (array1, array2) => {
   return array2.filter((element) => {
      return !array1.includes(element)
   })
}

export const makeRequestingGroupIdFirst = (
   arrayOfGroupIds = [],
   requestingGroupId
) => {
   let newArray = [...arrayOfGroupIds]
   if (!requestingGroupId) return newArray
   const RequestingGroupIsInArray = newArray.find(
      (groupId) => requestingGroupId === groupId
   )
   if (!RequestingGroupIsInArray) return newArray
   newArray = newArray.filter((groupId) => groupId !== requestingGroupId)
   newArray.unshift(requestingGroupId)
   return newArray
}

export const studentBelongsToGroup = (student, group) => {
   // return (
   //    student && student.groupIds && student.groupIds.includes(group.groupId)
   // );
   if (group.universityCode) {
      return (
         student &&
         student.university &&
         student.university.code === group.universityCode
      )
   } else {
      return (
         student && student.groupIds && student.groupIds.includes(group.groupId)
      )
   }
}

export const convertPollOptionsObjectToArray = (pollOptionsObject) => {
   return Object.keys(pollOptionsObject).map((key) => ({
      ...pollOptionsObject[key],
      index: key,
   }))
}

export const getRegisteredGroupById = (student, groupId) => {
   return (
      student.registeredGroups &&
      student.registeredGroups.find((category) => category.groupId === groupId)
   )
}

export const stringMatches = (basString, stringsToMatch) => {
   return stringsToMatch.some(
      (stringToMatch) =>
         stringToMatch.toLowerCase().replace(/\s/g, "") ===
         basString.toLowerCase().replace(/\s/g, "")
   )
}

export const getStudentInGroupDataObject = (student, group) => {
   const studentDataObject = {
      "First Name": student.firstName,
      "Last Name": student.lastName,
      Email: student.userEmail,
      University: (student.university && student.university.name) || "N/A",
   }
   const studentCategoriesForGroup = getRegisteredGroupById(
      student,
      group.groupId
   )
   if (
      studentCategoriesForGroup &&
      studentCategoriesForGroup.categories &&
      studentCategoriesForGroup.categories.length &&
      group.categories
   ) {
      group.categories.forEach((category) => {
         const studentCatValue = studentCategoriesForGroup.categories.find(
            (studCat) => studCat.id === category.id
         )
         if (studentCatValue) {
            const studentSelectedOption = category.options.find(
               (option) => option.id === studentCatValue.selectedValueId
            )
            if (studentSelectedOption) {
               studentDataObject[category.name] = studentSelectedOption.name
            }
         }
      })
   }
   return studentDataObject
}

export const groupHasSpecializedCategories = (group) => {
   if (group.categories) {
      const fieldOfStudyCategory = group.categories.find((category) =>
         stringMatches(category.name, ["field of study", "Domaine d'étude"])
      )
      const levelOfStudyCategory = group.categories.find((category) =>
         stringMatches(category.name, ["level of study"])
      )
      return fieldOfStudyCategory && levelOfStudyCategory
   }
   return false
}

export const getSpecializedStudentStats = (
   registeredStudentsFromGroup,
   group
) => {
   const fieldOfStudyCategory = group.categories.find((category) =>
      stringMatches(category.name, ["field of study", "Domaine d'étude"])
   )
   const levelOfStudyCategory = group.categories.find((category) =>
      stringMatches(category.name, ["level of study"])
   )
   const categoryStats = {
      type: "specialized",
      id: fieldOfStudyCategory.id,
      options: {},
      names: levelOfStudyCategory.options.map((option) => option.name),
   }
   fieldOfStudyCategory.options.forEach((option) => {
      const optionObj = {
         name: option.name,
         id: levelOfStudyCategory.id,
         entries: 0,
         subOptions: {},
      }
      levelOfStudyCategory.options.forEach((option2) => {
         optionObj.subOptions[option2.id] = {
            name: option2.name,
            entries: 0,
         }
      })
      categoryStats.options[option.id] = optionObj
   })
   registeredStudentsFromGroup.forEach((student) => {
      const registeredGroup = getRegisteredGroupById(student, group.groupId)
      const targetFieldOfStudyOption =
         registeredGroup &&
         registeredGroup.categories.find(
            (category) => category.id === fieldOfStudyCategory.id
         )
      const fieldOfStudyOptionId =
         targetFieldOfStudyOption && targetFieldOfStudyOption.selectedValueId
      const targetLevelOfStudyOption =
         registeredGroup &&
         registeredGroup.categories.find(
            (category) => category.id === levelOfStudyCategory.id
         )
      const levelOfStudyOptionId =
         targetLevelOfStudyOption && targetLevelOfStudyOption.selectedValueId
      if (
         categoryStats.options[fieldOfStudyOptionId] &&
         categoryStats.options[fieldOfStudyOptionId].subOptions[
            levelOfStudyOptionId
         ]
      ) {
         categoryStats.options[fieldOfStudyOptionId].entries =
            categoryStats.options[fieldOfStudyOptionId].entries + 1
         categoryStats.options[fieldOfStudyOptionId].subOptions[
            levelOfStudyOptionId
         ].entries =
            categoryStats.options[fieldOfStudyOptionId].subOptions[
               levelOfStudyOptionId
            ].entries + 1
      }
   })
   return categoryStats
}

export const getAggregateCategories = (participants, currentGroup) => {
   const categories = []
   if (participants) {
      participants.forEach((user) => {
         const matched =
            user &&
            user.registeredGroups &&
            user.registeredGroups.find(
               (groupData) => groupData.groupId === currentGroup.id
            )
         if (matched) {
            categories.push(matched)
         }
      })
   }
   return categories
}

export const getTypeOfStudents = (participants, currentCategory, group) => {
   const aggregateCategories = getAggregateCategories(participants, group)
   const flattenedGroupOptions = [...currentCategory.options].map((option) => {
      const entries = aggregateCategories.filter((category) =>
         category.categories.some(
            (userOption) => userOption.selectedValueId === option.id
         )
      ).length
      return { ...option, entries }
   })
   return {
      options: flattenedGroupOptions.sort((a, b) => b.entries - a.entries),
      categoryName: currentCategory.name,
      id: currentCategory.groupId,
   }
}
export const getNonSpecializedStats = (groupCategories, students, group) => {
   return {
      type: "non-specialized",
      noneSpecializedStats: groupCategories.map((category) =>
         getTypeOfStudents(students, category, group)
      ),
   }
}

export const getRegisteredStudentsStats = (
   registeredStudentsFromGroup,
   group
) => {
   if (groupHasSpecializedCategories(group)) {
      return getSpecializedStudentStats(registeredStudentsFromGroup, group)
   }
   return getNonSpecializedStats(
      group.categories || [],
      registeredStudentsFromGroup,
      group
   )
}

export const getRatingsAverage = (contentRatings) =>
   contentRatings.reduce((a, b) => {
      return a + b.rating || 0
   }, 0) / contentRatings.length

export const getDateString = (streamData) => {
   const dateString =
      streamData &&
      streamData.start &&
      streamData.start.toDate &&
      streamData.start.toDate().toString()
   return dateString || ""
}

export const markStudentStatsInUse = (totalParticipants, groupData) => {
   return totalParticipants.map((student) => {
      // Only modify that stats in use prop when it hasn't been assigned yet
      if (!student.statsInUse) {
         return {
            ...student,
            statsInUse: studentBelongsToGroup(student, groupData),
         }
      } else return student
   })
}

export const createNestedArrayOfTemplates = (
   arrayOfTemplates,
   chunkSize = 500
) => {
   const nestedArrayOfTemplates = []
   let i
   let j
   let tempArray
   for (i = 0, j = arrayOfTemplates.length; i < j; i += chunkSize) {
      tempArray = arrayOfTemplates.slice(i, i + chunkSize)
      nestedArrayOfTemplates.push(tempArray)
   }
   return nestedArrayOfTemplates
}

export const generateReferralCode = () => {
   // 1 generation per second (3600 signups per hour) would need ~32 years to have
   // a 1% chance of at least 1 collision https://zelark.github.io/nano-id-cc/
   const nanoid = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      11
   )

   return nanoid()
}

export const partition = <T>(
   array: T[],
   compareFn: (el: T, index?: number) => boolean
): {
   matches: T[]
   noMatches: T[]
} => {
   return array.reduce(
      (acc, curr, currentIndex) => {
         acc[compareFn(curr, currentIndex) ? "matches" : "noMatches"].push(curr)
         return acc
      },
      { matches: [], noMatches: [] }
   ) as { matches: T[]; noMatches: T[] }
}

/**
 * Detect if we're running the emulators
 *
 * @returns {string}
 */
export const isLocalEnvironment = () => {
   return (
      process.env.FIREBASE_AUTH_EMULATOR_HOST ||
      process.env.FIRESTORE_EMULATOR_HOST ||
      process.env.FUNCTIONS_EMULATOR ||
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
   )
}

export const logAxiosError = (error: any) => {
   functions.logger.error("Axios: JSON", error?.toJSON())
   if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      functions.logger.error("Axios: Error Response", {
         body: error.response.data,
         status: error.response.status,
         headers: error.response.headers,
      })
   } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      functions.logger.error(
         "Axios: Request made but no response was received",
         {
            request: error.request,
         }
      )
   } else {
      // Something happened in setting up the request that triggered an Error
      functions.logger.error(
         "Axios: Something happened in setting up the request that triggered an Error",
         error
      )
   }
}

/**
 * Logs the error and throws to force the function to stop and return an error
 * @param message
 * @param error
 * @param extraData
 */
export const logAxiosErrorAndThrow = (
   message: string,
   error: any,
   ...extraData
) => {
   functions.logger.error(message, extraData)
   logAxiosError(error)
   throw new functions.https.HttpsError("unknown", message)
}

type onCallFnHandler = (
   data: any,
   context: https.CallableContext
) => any | Promise<any>

/**
 * Function wrapper
 * Catches errors and improves logging for axios exceptions
 *  Helps with the debug
 *
 * Still throws the error to be handled by the cloud function
 * @param handler
 */
export const onCallWrapper = (handler: onCallFnHandler): onCallFnHandler => {
   return async (data, context) => {
      try {
         return await handler(data, context)
      } catch (e) {
         if (e.name === "AxiosError") {
            logAxiosError(e)
            const errorData = e.toJSON()
            const requestData = `${errorData?.status} - ${errorData?.config?.method} ${errorData?.config?.baseURL}${errorData?.config.url}`
            const error = new Error(
               `Failed to make outbound HTTP request via Axios: ${requestData}`
            )
            error.stack = e.stack
            throw error
         }

         throw e
      }
   }
}
