import { useCallback, useMemo, useState } from "react"
import { OfflineEventFormGeneralTabValues, TAB_VALUES } from "../form/types"
import { offlineEventFormGeneralTabSchema } from "../form/validationSchemas"

export const useTabNavigationAndValidation = (
   generalValues: OfflineEventFormGeneralTabValues
) => {
   const [tabValue, setTabValue] = useState<TAB_VALUES>(TAB_VALUES.GENERAL)
   const [tabToNavigateTo, setTabToNavigateTo] = useState<TAB_VALUES>(
      TAB_VALUES.GENERAL
   )

   const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)

   const isGeneralTabInvalid =
      !offlineEventFormGeneralTabSchema.isValidSync(generalValues)

   const shouldShowAlertIndicatorOnTab = useMemo(
      () => ({
         [TAB_VALUES.GENERAL]: isGeneralTabInvalid,
      }),
      [isGeneralTabInvalid]
   )

   const shouldShowAlertIndicator = Object.values(
      shouldShowAlertIndicatorOnTab
   ).some((value) => value)

   const navPreviousTab = useCallback(() => {
      // For now, only one tab, so no previous navigation
   }, [])

   const navNextTab = useCallback(() => {
      // For now, only one tab, so no next navigation
   }, [])

   const navigateWithValidationCheck = useCallback(
      (newTabValue: TAB_VALUES) => {
         if (shouldShowAlertIndicatorOnTab[tabValue]) {
            setTabToNavigateTo(newTabValue)
            setIsValidationDialogOpen(true)
         } else {
            setTabValue(newTabValue)
         }
      },
      [tabValue, shouldShowAlertIndicatorOnTab]
   )

   const handleValidationOpenDialog = useCallback(() => {
      setIsValidationDialogOpen(true)
   }, [])

   const handleValidationCloseDialog = useCallback(() => {
      setIsValidationDialogOpen(false)
      setTabValue(tabToNavigateTo)
   }, [tabToNavigateTo])

   return {
      tabValue,
      setTabValue,
      tabToNavigateTo,
      navPreviousTab,
      navNextTab,
      navigateWithValidationCheck,
      isValidationDialogOpen,
      handleValidationOpenDialog,
      handleValidationCloseDialog,
      shouldShowAlertIndicatorOnTab,
      shouldShowAlertIndicator,
      isGeneralTabInvalid,
   }
}
