import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useSnackbar } from "notistack"
import { useCallback, useEffect, useMemo, useState } from "react"
import isEqual from "react-fast-compare"
import {
   RecordingFormValues,
   useRecordingForm,
   useRecordingFormContext,
} from "./RecordingFormProvider"

const DEBOUNCE_TIME_MS = 1000

export const useRecordingAutoSave = () => {
   const firebaseService = useFirebaseService()
   const { watch, formState } = useRecordingForm()
   const { livestream } = useRecordingFormContext()
   const { enqueueSnackbar } = useSnackbar()

   const [isAutoSaving, setIsAutoSaving] = useState(false)

   // Watch all form values
   const currentValues = watch()

   const [previousValues, setPreviousValues] =
      useState<RecordingFormValues>(currentValues)

   // Initialize previousValues when form first loads
   useEffect(() => {
      if (
         currentValues.title !== "" ||
         currentValues.summary !== "" ||
         (currentValues.contentTopics &&
            currentValues.contentTopics.length > 0) ||
         (currentValues.businessFunctions &&
            currentValues.businessFunctions.length > 0) ||
         currentValues.backgroundImageUrl !== ""
      ) {
         setPreviousValues(currentValues)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const haveValuesChanged = useMemo(
      () => !isEqual(previousValues, currentValues),
      [previousValues, currentValues]
   )

   const updateRecording = useCallback(
      async (values: RecordingFormValues) => {
         const recording: Partial<LivestreamEvent> = {
            id: livestream.id,
            title: values.title || null,
            summary: values.summary || null,
            backgroundImageUrl: values.backgroundImageUrl || null,
            contentTopicsTagIds: values.contentTopics || [],
            businessFunctionsTagIds: values.businessFunctions || [],
         }

         await firebaseService.updateLivestream(recording, "livestreams", {})
      },
      [firebaseService, livestream.id]
   )

   const handleAutoSave = useCallback(async () => {
      if (haveValuesChanged && isAutoSaving && formState.isValid) {
         try {
            await updateRecording(currentValues)
            setPreviousValues(currentValues)
         } catch (error) {
            console.error("Auto-save failed:", error)
            enqueueSnackbar("Failed to auto-save recording", {
               variant: "error",
            })
         }
      }
   }, [
      currentValues,
      haveValuesChanged,
      isAutoSaving,
      formState.isValid,
      updateRecording,
      enqueueSnackbar,
   ])

   useEffect(() => {
      // If form is invalid or no changes, ensure we're not showing saving state
      if (!haveValuesChanged || !formState.isValid) {
         setIsAutoSaving(false)
         return
      }

      setIsAutoSaving(true)

      const debounceTimeout = setTimeout(async () => {
         try {
            await handleAutoSave()
         } finally {
            setIsAutoSaving(false)
         }
      }, DEBOUNCE_TIME_MS)

      return () => clearTimeout(debounceTimeout)
   }, [currentValues, formState.isValid, haveValuesChanged, handleAutoSave])

   return { isAutoSaving }
}
