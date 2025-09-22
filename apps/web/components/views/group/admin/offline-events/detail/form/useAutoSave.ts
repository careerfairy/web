import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { useAuth } from "HOCs/AuthProvider"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { offlineEventService } from "data/firebase/OfflineEventService"
import { useSnackbar } from "notistack"
import { useCallback, useEffect, useMemo, useState } from "react"
import isEqual from "react-fast-compare"
import { errorLogAndNotify } from "util/CommonUtil"
import { useOfflineEventCreationContext } from "../OfflineEventCreationContext"
import { useOfflineEventFormValues } from "./useOfflineEventFormValues"

const DEBOUNCE_TIME_MS = 3000

export const useAutoSave = () => {
   const firebaseService = useFirebaseService()
   const { offlineEvent, author, group } = useOfflineEventCreationContext()
   const { values, isValid } = useOfflineEventFormValues()
   const { enqueueSnackbar } = useSnackbar()
   const { userData } = useAuth()

   const [isAutoSaving, setIsAutoSaving] = useState(false)
   const [previousValues, setPreviousValues] = useState(values)

   const haveValuesChanged = useMemo(
      () => !isEqual(previousValues, values),
      [previousValues, values]
   )

   const updateOfflineEvent = useCallback(
      async (newValues: Partial<typeof values>) => {
         if (!offlineEvent?.id || !userData) return

         const updateData: Partial<OfflineEvent> = {
            id: offlineEvent.id,
            title: newValues.general?.title ?? "",
            description: newValues.general?.description ?? "",
            targetAudience: {
               universities:
                  newValues.general?.targetAudience?.universities ?? [],
               levelOfStudies:
                  newValues.general?.targetAudience?.levelOfStudies ?? [],
               fieldOfStudies:
                  newValues.general?.targetAudience?.fieldOfStudies ?? [],
            },
            registrationUrl: newValues.general?.registrationUrl ?? "",
            hidden: newValues.general?.hidden ?? false,
            backgroundImageUrl: newValues.general?.backgroundImageUrl ?? "",
            street: newValues.general?.street ?? null,
            startAt: firebaseService.getFirebaseTimestamp(
               newValues.general?.startAt ?? ""
            ),
         }

         await offlineEventService.updateOfflineEvent(updateData, author)
      },
      [offlineEvent.id, author, firebaseService, userData]
   )

   const handleAutoSave = useCallback(async () => {
      if (haveValuesChanged) {
         setPreviousValues(values)

         // Only autosave if the offline event exists and has an ID
         // and the offline event is a draft
         if (offlineEvent?.id) {
            await updateOfflineEvent(values)
         }
      }
   }, [values, haveValuesChanged, offlineEvent?.id, updateOfflineEvent])

   useEffect(() => {
      const isDraft = offlineEvent?.status === "draft"

      const debounceTimeout = setTimeout(async () => {
         try {
            if (haveValuesChanged && !isAutoSaving && isDraft) {
               // For drafts, always allow autosaving regardless of validation
               setIsAutoSaving(true)
               await handleAutoSave()
            }
         } catch (error) {
            errorLogAndNotify(error, {
               message: "Failed to auto-save offline event",
               offlineEventId: offlineEvent?.id,
               groupId: group?.id,
            })
            enqueueSnackbar("Failed to auto-save offline event", {
               variant: "error",
            })
         } finally {
            setIsAutoSaving(false)
         }
      }, DEBOUNCE_TIME_MS)

      return () => clearTimeout(debounceTimeout)
   }, [
      values,
      haveValuesChanged,
      isAutoSaving,
      offlineEvent?.status,
      isValid,
      handleAutoSave,
      enqueueSnackbar,
      group?.id,
      offlineEvent?.id,
   ])

   return { isAutoSaving }
}
