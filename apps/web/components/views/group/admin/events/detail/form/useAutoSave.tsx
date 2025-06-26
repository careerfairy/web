import { Group } from "@careerfairy/shared-lib/groups"
import { CreatorRoles } from "@careerfairy/shared-lib/groups/creators"
import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { useFieldsOfStudy } from "components/custom-hook/useCollection"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { customJobRepo, groupRepo } from "data/RepositoryInstances"
import { FormikErrors } from "formik"
import cloneDeep from "lodash/cloneDeep"
import omit from "lodash/omit"
import { useSnackbar } from "notistack"
import { useCallback, useEffect, useMemo, useState } from "react"
import isEqual from "react-fast-compare"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { mapFormValuesToLivestreamObject } from "./commons"
import {
   LivestreamFormJobsTabValues,
   LivestreamFormQuestionsTabValues,
   LivestreamFormSpeakersTabValues,
   LivestreamFormValues,
} from "./types"
import { useLivestreamFormValues } from "./useLivestreamFormValues"
import { mapFeedbackQuestionToRatings } from "./views/questions/commons"

const DEBOUNCE_TIME_MS = 2000

const getDeepKeysPathsInner = (prev, obj) => {
   let keys = []
   for (const key in obj) {
      /*
         Array elements are represented with their indexes.
         If the previous value is a number, it means we are analysing an array element. 
         This is used in the context of form errors, therefore it means this array element has an error so we skip its analysis. 
      */
      if (!isNaN(parseFloat(prev)) && isFinite(parseFloat(prev))) {
         continue
      }

      /*
         This condition handles a Formik edge case.
         For arrays, Formik sets undefined if the array element doesn't have any error. 
         
         Example for reasonsToJoin: 
         - form value: ["My reason to join", , ]
         - form error: [undefined, "Required", "Required"]
      */
      if (obj[key] === undefined || obj[key] === null) {
         continue
      }

      keys.push(key)

      if (typeof obj[key] === "object") {
         const subkeys = getDeepKeysPathsInner(key, obj[key])
         keys = keys.concat(subkeys.map((subkey) => key + "." + subkey))
      }
   }
   return keys
}

const getDeepKeysPaths = (obj): string[] => {
   return getDeepKeysPathsInner(null, obj)
}

const hasAnyStringThatStartsWith = (stringArray, specifiedString) => {
   return (
      stringArray.filter((anyStringElment) =>
         anyStringElment.startsWith(`${specifiedString}.`)
      ).length === 0
   )
}

const getFormValuesWithoutErrors = (
   values: LivestreamFormValues,
   errors: FormikErrors<LivestreamFormValues>
): Partial<LivestreamFormValues> => {
   // Output example: ["general", "general.title"]
   const keysPathThatDiffer = getDeepKeysPaths(errors)

   const onlyNestedKeyPathThatDiffer = keysPathThatDiffer.filter((key) =>
      hasAnyStringThatStartsWith(keysPathThatDiffer, key)
   )

   return omit(values, onlyNestedKeyPathThatDiffer)
}

const getSpeakersThatAreCreators = (
   speakers: LivestreamFormSpeakersTabValues["values"] | Speaker[],
   options: LivestreamFormSpeakersTabValues["options"]
) => {
   if (!speakers) return []

   return speakers.filter((speaker) => {
      const isCreator = options.some(
         (option) => option.id === speaker.id && option.isCreator
      )
      return isCreator
   })
}

export const useAutoSave = () => {
   const firebaseService = useFirebaseService()
   const { livestream, targetLivestreamCollection } =
      useLivestreamCreationContext()
   const { values, errors, isValid } = useLivestreamFormValues()
   const { enqueueSnackbar } = useSnackbar()
   const { data: allFieldsOfStudy } = useFieldsOfStudy()

   const [isAutoSaving, setIsAutoSaving] = useState(false)
   const [previousValues, setPreviousValues] = useState(values)

   const haveValuesChanged = useMemo(
      () => !isEqual(previousValues, values),
      [previousValues, values]
   )

   const updateCreatorsRoles = useCallback(
      async (
         previousSpeakers: LivestreamFormSpeakersTabValues["values"],
         newSpeakers: Speaker[],
         options: LivestreamFormSpeakersTabValues["options"],
         groupId: Group["id"]
      ) => {
         const removedSpeakers = previousSpeakers?.filter(
            (prevSpeaker) =>
               !newSpeakers?.some(
                  (newSpeaker) => newSpeaker.id === prevSpeaker.id
               )
         )

         const removedSpeakersThatAreCreators = getSpeakersThatAreCreators(
            removedSpeakers,
            options
         ).map((speakerCreator) => {
            return {
               ...speakerCreator,
               roles: speakerCreator.roles.filter(
                  (role) => role !== CreatorRoles.Speaker
               ),
            }
         })

         const deletePromises = removedSpeakersThatAreCreators?.map(
            async (speakerCreator) =>
               groupRepo.updateCreatorRolesInGroup(
                  groupId,
                  speakerCreator.id,
                  speakerCreator.roles
               )
         )

         const addedSpeakers = newSpeakers?.filter(
            (newSpeaker) =>
               !previousSpeakers.some(
                  (prevSpeaker) => newSpeaker.id === prevSpeaker.id
               )
         )

         const speakersThatAreCreators = getSpeakersThatAreCreators(
            addedSpeakers,
            options
         )

         const updatePromises = speakersThatAreCreators?.map(
            async (speakerCreator) =>
               groupRepo.updateCreatorRolesInGroup(
                  groupId,
                  speakerCreator.id,
                  speakerCreator.roles
               )
         )

         await Promise.all([...deletePromises, ...updatePromises])
      },
      []
   )

   const updateFeedbackQuestions = useCallback(
      async (
         feedbackQuestions: LivestreamFormQuestionsTabValues["feedbackQuestions"]
      ) => {
         for (const question of feedbackQuestions) {
            if (!question.question || !question.type || !question.appearAfter) {
               continue
            }
            const rating = mapFeedbackQuestionToRatings(
               question,
               livestream.duration
            )

            if (question.deleted) {
               await firebaseService.deleteFeedbackQuestion(
                  livestream.id,
                  rating.id,
                  targetLivestreamCollection
               )
            } else {
               await firebaseService.upsertFeedbackQuestion(
                  targetLivestreamCollection,
                  livestream.id,
                  rating.id,
                  rating
               )
            }
         }
      },
      [
         firebaseService,
         livestream.duration,
         livestream.id,
         targetLivestreamCollection,
      ]
   )

   const updateCustomJobs = useCallback(
      async (
         previousCustomJobs: LivestreamFormJobsTabValues["customJobs"],
         newCustomJobs: LivestreamFormJobsTabValues["customJobs"]
      ) => {
         const removedCustomJobs = previousCustomJobs.filter(
            (prevJob) =>
               !newCustomJobs.some((newJob) => newJob.id === prevJob.id)
         )

         const promises = []

         for (const job of removedCustomJobs) {
            promises.push(
               customJobRepo.updateCustomJobWithLinkedLivestreams(
                  livestream.id,
                  [job.id],
                  true
               )
            )
         }

         for (const job of newCustomJobs) {
            promises.push(
               customJobRepo.updateCustomJobWithLinkedLivestreams(
                  livestream.id,
                  [job.id],
                  false
               )
            )
         }

         await Promise.all(promises)
      },
      [livestream.id]
   )

   const updateLivestream = useCallback(
      async (
         newValues: Partial<LivestreamFormValues>,
         previousSpeakers: LivestreamFormSpeakersTabValues["values"],
         previousJobs: LivestreamFormJobsTabValues
      ) => {
         const mappedObject = mapFormValuesToLivestreamObject(
            newValues,
            allFieldsOfStudy,
            firebaseService
         )

         updateCreatorsRoles(
            previousSpeakers,
            mappedObject.speakers,
            newValues.speakers.options,
            livestream.groupIds[0]
         )

         if (newValues?.questions?.feedbackQuestions?.length > 0) {
            updateFeedbackQuestions(newValues.questions.feedbackQuestions)
         }

         updateCustomJobs(previousJobs.customJobs, newValues.jobs.customJobs)

         await firebaseService.updateLivestream(
            { ...mappedObject, id: livestream.id },
            targetLivestreamCollection,
            {}
         )
      },
      [
         allFieldsOfStudy,
         firebaseService,
         livestream.groupIds,
         livestream.id,
         targetLivestreamCollection,
         updateCreatorsRoles,
         updateCustomJobs,
         updateFeedbackQuestions,
      ]
   )

   const handleAutoSave = useCallback(async () => {
      const previousJobs = cloneDeep(previousValues.jobs)
      const previousSpeakers = cloneDeep(previousValues.speakers.values)
      if (haveValuesChanged) {
         setPreviousValues(values)
         if (livestream.isDraft) {
            const formValuesWithoutErrors = getFormValuesWithoutErrors(
               cloneDeep(values),
               errors
            )

            updateLivestream(
               formValuesWithoutErrors,
               previousSpeakers,
               previousJobs
            )
         } else if (isValid) {
            updateLivestream(values, previousSpeakers, previousJobs)
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [values, errors])

   useEffect(() => {
      if (haveValuesChanged && !isAutoSaving) {
         if (livestream.isDraft) {
            setIsAutoSaving(true)
         } else if (isValid) {
            setIsAutoSaving(true)
         }
      }

      const debounceTimeout = setTimeout(async () => {
         try {
            await handleAutoSave()
         } catch (error) {
            console.error("Auto-save failed:", error)
            enqueueSnackbar("Failed to auto-save live stream", {
               variant: "error",
            })
         } finally {
            setIsAutoSaving(false)
         }
      }, DEBOUNCE_TIME_MS)

      return () => clearTimeout(debounceTimeout)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [values, errors])

   return { isAutoSaving }
}
