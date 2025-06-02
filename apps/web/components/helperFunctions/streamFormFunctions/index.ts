import { CreatorRoles } from "@careerfairy/shared-lib/groups/creators"
import { LivestreamEvent, Speaker } from "@careerfairy/shared-lib/livestreams"
import { livestreamTriGrams } from "@careerfairy/shared-lib/utils/search"
import { BrandedTextFieldProps } from "components/views/common/inputs/BrandedTextField"
import { FormikErrors, FormikTouched } from "formik"
import { v4 as uuidv4 } from "uuid"
import { shouldUseEmulators } from "../../../util/CommonUtil"
import { DraftFormValues } from "../../views/draftStreamForm/DraftStreamForm"

export const speakerObj = {
   avatar: "",
   firstName: "",
   lastName: "",
   position: "",
   background: "",
   email: "",
   roles: [CreatorRoles.Speaker],
}

export const getStreamSubCollectionSpeakers = (
   livestream,
   speakerQuery
): Record<string, Speaker> => {
   if (!speakerQuery.empty && !livestream.speakers) {
      // if this stream doc has no speakers array and but has a sub-collection
      const speakersObj: Record<string, Speaker> = {}
      speakerQuery.forEach((query) => {
         const speaker = query.data()
         speaker.id = query.id
         speakersObj[speaker.id] = speaker
         speaker.roles = query.roles || [CreatorRoles.Speaker]
      })
      return speakersObj
   } else if (livestream.speakers?.length) {
      const speakersObj = {}
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
      groupQuestionsMap: values.groupQuestionsMap,
      type: "upcoming",
      test: false,
      groupIds: [...new Set(values.groupIds)],
      hidden: values.hidden,
      universities: [],
      summary: values.summary,
      reasonsToJoinLivestream: values.reasonsToJoinLivestream,
      reasonsToJoinLivestream_v2: values.reasonsToJoinLivestream_v2,
      speakers: buildSpeakersArray(values),
      creatorsIds: values.creatorsIds,
      businessFunctionsTagIds: values.businessFunctionsTagIds.map(
         (tag) => tag.id
      ),
      contentTopicsTagIds: values.contentTopicsTagIds.map((tag) => tag.id),
      language: values.language,
      lastUpdated: firebase.getServerTimestamp(),
      hasEnded: false,
      targetFieldsOfStudy: values.targetFieldsOfStudy,
      targetLevelsOfStudy: values.targetLevelsOfStudy,
      questionsDisabled: values.questionsDisabled,
      triGrams: livestreamTriGrams(values.title, values.company),
      denyRecordingAccess: false,
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
         roles: values.speakers[key].roles || [CreatorRoles.Speaker],
      }
   })
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
      host = "http://127.0.0.1:9199"
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
   // @ts-ignore
   helperText: touched[name] && errors[name],
})
