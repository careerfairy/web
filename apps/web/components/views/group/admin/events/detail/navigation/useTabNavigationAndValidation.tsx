import { useCallback, useState, useMemo } from "react"
import {
   MAX_TAB_VALUE,
   TAB_VALUES,
} from "components/views/group/admin/events/detail/form/commons"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import {
   livestreamFormGeneralTabSchema,
   livestreamFormSpeakersTabSchema,
} from "../form/validationSchemas"

export const useTabNavigationAndValidation = (general, speakers) => {
   const [tabValue, setTabValue] = useState<TAB_VALUES>(TAB_VALUES.GENERAL)
   const [tabToNavigateTo, setTabToNavigateTo] = useState<TAB_VALUES>(undefined)
   const [tabsVisited, setTabsVisited] = useState<Record<TAB_VALUES, boolean>>({
      [TAB_VALUES.GENERAL]: true,
      [TAB_VALUES.SPEAKERS]: false,
      [TAB_VALUES.QUESTIONS]: false,
      [TAB_VALUES.JOBS]: false,
   })
   const [alertState, setAlertState] = useState<boolean | undefined>(undefined)

   const [
      isValidationDialogOpen,
      handleValidationOpenDialog,
      handleValidationCloseDialog,
   ] = useDialogStateHandler()

   const isGeneralTabInvalid =
      !livestreamFormGeneralTabSchema.isValidSync(general) &&
      tabsVisited[TAB_VALUES.GENERAL]
   const isSpeakerTabInvalid =
      !livestreamFormSpeakersTabSchema.isValidSync(speakers) &&
      tabsVisited[TAB_VALUES.SPEAKERS]
   const formHasCriticalValidationErrors =
      isGeneralTabInvalid || isSpeakerTabInvalid

   const shouldShowAlertIndicatorOnTab = useMemo(
      () => ({
         [TAB_VALUES.GENERAL]: alertState !== undefined && isGeneralTabInvalid,
         [TAB_VALUES.SPEAKERS]: alertState !== undefined && isSpeakerTabInvalid,
      }),
      [alertState, isGeneralTabInvalid, isSpeakerTabInvalid]
   )

   const shouldShowAlertIndicator =
      alertState !== undefined && formHasCriticalValidationErrors

   const shouldShowAlertDialog =
      (alertState === true || alertState == undefined) &&
      formHasCriticalValidationErrors

   const navigateWithValidationCheck = useCallback(
      (newTabValue: TAB_VALUES) => {
         if (shouldShowAlertDialog) {
            setAlertState(true)
            handleValidationOpenDialog()
            setTabToNavigateTo(newTabValue)
         } else {
            setTabValue(newTabValue)
         }

         if (!tabsVisited[tabValue]) {
            setTabsVisited((prev) => ({ ...prev, [tabValue]: true }))
         }
      },
      [handleValidationOpenDialog, shouldShowAlertDialog, tabValue, tabsVisited]
   )

   const navPreviousTab = useCallback(() => {
      if (tabValue !== TAB_VALUES.GENERAL) {
         navigateWithValidationCheck(tabValue - 1)
      }
   }, [navigateWithValidationCheck, tabValue])

   const navNextTab = useCallback(() => {
      if (tabValue !== MAX_TAB_VALUE) {
         navigateWithValidationCheck(tabValue + 1)
      }
   }, [navigateWithValidationCheck, tabValue])

   return {
      tabValue,
      setTabValue,
      tabToNavigateTo,
      navPreviousTab,
      navNextTab,
      navigateWithValidationCheck,
      setAlertState,
      isValidationDialogOpen,
      handleValidationOpenDialog,
      handleValidationCloseDialog,
      shouldShowAlertIndicatorOnTab,
      shouldShowAlertIndicator,
      isGeneralTabInvalid,
      isSpeakerTabInvalid,
   }
}
