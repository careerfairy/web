import { v4 as uuidv4 } from "uuid"
import {
   LivestreamEvent,
   LivestreamPromotions,
   Speaker,
} from "@careerfairy/shared-lib/livestreams"
import { livestreamTriGrams } from "@careerfairy/shared-lib/utils/search"
import { DraftFormValues } from "../../views/draftStreamForm/DraftStreamForm"
import { shouldUseEmulators } from "../../../util/CommonUtil"
import { EMAIL_REGEX } from "components/util/constants"
import { FormikErrors, FormikTouched } from "formik"
import { BrandedTextFieldProps } from "components/views/common/inputs/BrandedTextField"
import { PublicCustomJob } from "@careerfairy/shared-lib/groups/customJobs"

export const speakerObj = {
   avatar: "",
   firstName: "",
   lastName: "",
   position: "",
   background: "",
   email: "",
}

export const getStreamSubCollectionSpeakers = (
   livestream,
   speakerQuery
): Record<string, Speaker> => {
   if (!speakerQuery.empty && !livestream.speakers) {
      // if this stream doc has no speakers array and but has a sub-collection
      let speakersObj: Record<string, Speaker> = {}
      speakerQuery.forEach((query) => {
         let speaker = query.data()
         speaker.id = query.id
         speakersObj[speaker.id] = speaker
      })
      return speakersObj
   } else if (livestream.speakers?.length) {
      let speakersObj = {}
      livestream.speakers.forEach((speaker: Speaker) => {
         if (!speaker.background) {
            speaker.background = ""
         }
         speakersObj[speaker.id] = speaker
      })
      return speakersObj
   } else {
      const newId = uuidv4()
      return { [newId]: { ...speakerObj, id: newId } }
   }
}

export const handleAddSection = (objName, values, setValues, newSection) => {
   const newValues = { ...values }
   newValues[objName][uuidv4()] = newSection
   setValues(newValues)
}

export const handleDeleteSection = (objName, key, values, setCallback) => {
   const newValues = { ...values }
   delete newValues[objName][key]
   setCallback(newValues)
}

export const handleErrorSection = (
   objName,
   key,
   fieldName,
   errors,
   touched
) => {
   const baseError = errors?.[objName]?.[key]?.[fieldName]
   const baseTouched = touched?.[objName]?.[key]?.[fieldName]
   return baseError && baseTouched && baseError
}

export const buildLivestreamObject = (
   values: DraftFormValues,
   updateMode,
   streamId: string,
   firebase
): LivestreamEvent => {
   return {
      ...(updateMode && { id: streamId }), // only adds id: livestreamId field if there's actually a valid id, which is when updateMode is true
      backgroundImageUrl: values.backgroundImageUrl,
      company: values.company,
      companyId: values.companyId,
      title: values.title,
      companyLogoUrl: values.companyLogoUrl,
      start: firebase.getFirebaseTimestamp(values.start),
      duration: values.duration,
      interestsIds: [...new Set(values.interestsIds)],
      groupQuestionsMap: values.groupQuestionsMap,
      type: "upcoming",
      test: false,
      groupIds: [...new Set(values.groupIds)],
      hidden: values.hidden,
      universities: [],
      summary: values.summary,
      reasonsToJoinLivestream: values.reasonsToJoinLivestream,
      speakers: buildSpeakersArray(values),
      language: values.language,
      lastUpdated: firebase.getServerTimestamp(),
      hasEnded: false,
      targetFieldsOfStudy: values.targetFieldsOfStudy,
      targetLevelsOfStudy: values.targetLevelsOfStudy,
      questionsDisabled: values.questionsDisabled,
      triGrams: livestreamTriGrams(values.title, values.company),
      denyRecordingAccess: false,
      customJobs: buildCustomJobArray(values.customJobs),
   }
}

const buildSpeakersArray = (values) => {
   return Object.keys(values.speakers).map((key, index) => {
      return {
         id: key,
         avatar: values.speakers[key].avatar || "",
         background: values.speakers[key].background,
         firstName: values.speakers[key].firstName,
         lastName: values.speakers[key].lastName,
         position: values.speakers[key].position,
         email: values.speakers[key].email || "",
         rank: index,
      }
   })
}

const buildCustomJobArray = (values: PublicCustomJob[]): PublicCustomJob[] => {
   return values.map((job) => {
      const postingUrlFormatted =
         job.postingUrl.indexOf("http") === 0
            ? job.postingUrl
            : `https://${job.postingUrl}`

      return {
         ...job,
         postingUrl: postingUrlFormatted,
      }
   })
}

export const buildPromotionObj = (
   values,
   livestreamId
): Partial<LivestreamPromotions> => {
   return {
      livestreamId: livestreamId,
      promotionChannelsCodes: values?.promotionChannelsCodes || [],
      promotionCountriesCodes: values?.promotionCountriesCodes || [],
      promotionUniversitiesCodes: values?.promotionUniversitiesCodes || [],
   }
}

export const handleAddTargetCategories = (
   arrayOfIds,
   setTargetCategories,
   targetCategories
) => {
   const oldTargetCategories = { ...targetCategories }
   const newTargetCategories = {}
   arrayOfIds.forEach((id) => {
      if (!oldTargetCategories[id]) {
         newTargetCategories[id] = []
      } else {
         newTargetCategories[id] = oldTargetCategories[id]
      }
   })
   setTargetCategories(newTargetCategories)
}

export const handleFlattenOptions = (group) => {
   let optionsArray = []
   if (group.categories && group.categories.length) {
      group.categories.forEach((category) => {
         if (category.options && category.options.length) {
            category.options.forEach((option) => optionsArray.push(option))
         }
      })
   }
   return optionsArray
}
export const handleFlattenOptionsWithoutLvlOfStudy = (group) => {
   let optionsArray = []
   if (group.categories && group.categories.length) {
      group.categories.forEach((category) => {
         if (
            category.options &&
            category.name.toLowerCase() !== "level of study" &&
            category.options.length
         ) {
            category.options.forEach((option) => optionsArray.push(option))
         }
      })
   }
   return optionsArray
}

export const validateStreamForm = (
   values,
   isDraft,
   noValidation = false,
   isPastStream = false
) => {
   let errors: FormikErrors<DraftFormValues> = {
      speakers: {},
   }
   if (!values.companyLogoUrl) {
      errors.companyLogoUrl = "Required"
   }
   if (!values.backgroundImageUrl) {
      errors.backgroundImageUrl = "Required"
   }
   if (!values.company) {
      errors.company = "Required"
   }
   if (!isDraft && !values.companyId) {
      errors.companyId = "Required"
   }
   if (!values.title) {
      errors.title = "Required"
   }
   if (!values.summary) {
      errors.summary = "Required"
   }
   if (
      !values.reasonsToJoinLivestream ||
      values.reasonsToJoinLivestream.trim().length < 20
   ) {
      errors.reasonsToJoinLivestream = "Minimum of 20 characters"
   }

   const now = new Date()

   if (!isPastStream && (!values.start || values.start < now)) {
      errors.start = "Please select a date in the future"
   }

   Object.keys(values.speakers).forEach((key) => {
      errors.speakers[key] = {}
      if (!values.speakers[key].firstName) {
         errors.speakers[key].firstName = "Required"
      }
      if (!values.speakers[key].lastName) {
         errors.speakers[key].lastName = "Required"
      }
      if (!values.speakers[key].position) {
         errors.speakers[key].position = "Required"
      }
      if (!values.speakers[key].avatar) {
         errors.speakers[key].avatar = "Required"
      }

      const speakerEmail = values.speakers[key].email || ""

      if (isDraft && !speakerEmail) {
         errors.speakers[key].email = "Required"
      }
      if (speakerEmail.length && !EMAIL_REGEX.test(speakerEmail)) {
         errors.speakers[key].email = "Please add a valid email"
      }
      if (!Object.keys(errors.speakers[key]).length) {
         delete errors.speakers[key]
      }
   })
   if (!Object.keys(errors.speakers).length) {
      delete errors.speakers
   }

   if (values.interestsIds?.length === 0) {
      errors.interestsIds = "Please select at least one category."
   }

   return noValidation ? {} : errors
}

export const languageCodes = [
   {
      code: "en",
      name: "English",
      shortName: "eng",
   },
   {
      code: "de",
      name: "German",
      shortName: "ger",
   },
   {
      code: "fr",
      name: "French",
      shortName: "fra",
   },
   {
      code: "it",
      name: "Italian",
      shortName: "ita",
   },
   {
      code: "es",
      name: "Spanish",
      shortName: "spa",
   },
   {
      code: "nl",
      name: "Dutch",
      shortName: "nld",
   },
   {
      code: "pt",
      name: "Portuguese",
      shortName: "por",
   },
]

export const languageCodesDict = languageCodes.reduce(
   (acc, curr) => ({
      ...acc,
      [curr.code]: curr,
   }),
   {}
)

export const getDownloadUrl = (fileElement) => {
   let host = "https://firebasestorage.googleapis.com"

   if (shouldUseEmulators()) {
      host = "http://localhost:9199"
   }

   console.log("-> fileElement", fileElement)
   if (fileElement) {
      return `${host}/v0/b/careerfairy-e1fd9.appspot.com/o/${fileElement.replace(
         "/",
         "%2F"
      )}?alt=media`
   } else {
      console.log("-> no fileElement", fileElement)
      return ""
   }
}

export const getTextFieldProps = <TFormValues>(
   label: string,
   name: keyof TFormValues,
   touched: FormikTouched<TFormValues>,
   errors: FormikErrors<TFormValues>
): BrandedTextFieldProps => ({
   label,
   error: touched[name] && Boolean(errors[name]),
   helperText: touched[name] && errors[name],
})
