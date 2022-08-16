import { v4 as uuidv4 } from "uuid"

export const speakerObj = {
   avatar: "",
   firstName: "",
   lastName: "",
   position: "",
   background: "",
}

export const getStreamSubCollectionSpeakers = (livestream, speakerQuery) => {
   if (!speakerQuery.empty && !livestream.speakers) {
      // if this stream doc has no speakers array and but has a sub-collection
      let speakersObj = {}
      speakerQuery.forEach((query) => {
         let speaker = query.data()
         speaker.id = query.id
         speakersObj[speaker.id] = speaker
      })
      return speakersObj
   } else if (livestream.speakers?.length) {
      let speakersObj = {}
      livestream.speakers.forEach((speaker) => {
         if (!speaker.background) {
            speaker.background = ""
         }
         speakersObj[speaker.id] = speaker
      })
      return speakersObj
   } else {
      return { [uuidv4()]: speakerObj }
   }
}

export const handleAddSpeaker = (values, setValues, speakerObj) => {
   const newValues = { ...values }
   newValues.speakers[uuidv4()] = speakerObj
   setValues(newValues)
}

export const handleDeleteSpeaker = (key, values, setCallback) => {
   const newValues = { ...values }
   delete newValues.speakers[key]
   setCallback(newValues)
}

export const handleError = (key, fieldName, errors, touched) => {
   const baseError = errors?.speakers?.[key]?.[fieldName]
   const baseTouched = touched?.speakers?.[key]?.[fieldName]
   return baseError && baseTouched && baseError
}

export const buildLivestreamObject = (
   values,
   targetCategories,
   updateMode,
   streamId,
   firebase
) => {
   return {
      ...(updateMode && { id: streamId }), // only adds id: livestreamId field if there's actually a valid id, which is when updateMode is true
      backgroundImageUrl: values.backgroundImageUrl,
      company: values.company,
      companyId: values.companyId,
      title: values.title,
      companyLogoUrl: values.companyLogoUrl,
      start: firebase.getFirebaseTimestamp(values.start),
      duration: values.duration,
      targetCategories: targetCategories,
      interestsIds: [...new Set(values.interestsIds)],
      type: "upcoming",
      test: false,
      groupIds: [...new Set(values.groupIds)],
      hidden: values.hidden,
      universities: [],
      summary: values.summary,
      speakers: buildSpeakersArray(values),
      language: values.language,
      lastUpdated: firebase.getServerTimestamp(),
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
         rank: index,
      }
   })
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

export const validateStreamForm = (values, isDraft, noValidation = false) => {
   let errors = { speakers: {} }
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
      // if (!values.speakers[key].background) { Made background not required
      //     errors.speakers[key].background = 'Required';
      // }
      if (!Object.keys(errors.speakers[key]).length) {
         delete errors.speakers[key]
      }
   })
   if (!Object.keys(errors.speakers).length) {
      delete errors.speakers
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

   if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
      host = " http://localhost:9199"
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
