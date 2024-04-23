import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { customJobRepo } from "data/RepositoryInstances"
import { FormikErrors } from "formik"
import { cloneDeep, omit } from "lodash"
import { useSnackbar } from "notistack"
import { useCallback, useEffect, useMemo, useState } from "react"
import isEqual from "react-fast-compare"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { mapFormValuesToLivestreamObject } from "./commons"
import {
   LivestreamFormJobsTabValues,
   LivestreamFormQuestionsTabValues,
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

export const useAutoSave = () => {
   const firebaseService = useFirebaseService()
   const { livestream, targetLivestreamCollection } =
      useLivestreamCreationContext()
   const { values, errors, isValid } = useLivestreamFormValues()
   const { enqueueSnackbar } = useSnackbar()

   const [isAutoSaving, setIsAutoSaving] = useState(false)
   const [previousValues, setPreviousValues] = useState(values)

   const haveValuesChanged = useMemo(
      () => !isEqual(previousValues, values),
      [previousValues, values]
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
      async (customJobs: LivestreamFormJobsTabValues["customJobs"]) => {
         for (const job of customJobs) {
            await customJobRepo.updateCustomJobWithLinkedLivestreams(
               livestream.id,
               [job.id],
               job.deleted
            )
         }
      },
      [livestream.id]
   )

   const updateLivestream = useCallback(
      async (newValues: Partial<LivestreamFormValues>) => {
         const mappedObject = mapFormValuesToLivestreamObject(
            newValues,
            firebaseService
         )

         if (newValues?.questions?.feedbackQuestions?.length > 0) {
            updateFeedbackQuestions(newValues.questions.feedbackQuestions)
         }

         if (newValues?.jobs?.customJobs?.length > 0) {
            updateCustomJobs(newValues.jobs.customJobs)
         }

         await firebaseService.updateLivestream(
            { ...mappedObject, id: livestream.id },
            targetLivestreamCollection,
            {}
         )
      },
      [
         firebaseService,
         livestream.id,
         targetLivestreamCollection,
         updateCustomJobs,
         updateFeedbackQuestions,
      ]
   )

   const handleAutoSave = useCallback(async () => {
      if (haveValuesChanged) {
         setPreviousValues(values)
         if (livestream.isDraft) {
            const formValuesWithoutErrors = getFormValuesWithoutErrors(
               cloneDeep(values),
               errors
            )

            updateLivestream(formValuesWithoutErrors)
         } else if (isValid) {
            updateLivestream(values)
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
