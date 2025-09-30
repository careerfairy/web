import { Group } from "@careerfairy/shared-lib/groups"
import { AuthorInfo } from "@careerfairy/shared-lib/livestreams/livestreams"
import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { useAuth } from "HOCs/AuthProvider"
import {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useMemo,
} from "react"
import { useEffectOnce } from "react-use"
import { TAB_VALUES } from "./form/types"
import { useOfflineEventFormValues } from "./form/useOfflineEventFormValues"
import { useTabNavigationAndValidation } from "./navigation/useTabNavigationAndValidation"

type OfflineEventCreationContextType = {
   offlineEvent: OfflineEvent
   targetOfflineEventCollection: "offlineEvents"
   tabToNavigateTo: TAB_VALUES
   tabValue: TAB_VALUES
   setTabValue: Dispatch<SetStateAction<TAB_VALUES>>
   navPreviousTab: () => void
   navNextTab: () => void
   navigateWithValidationCheck: (newTabValue: TAB_VALUES) => void
   isValidationDialogOpen: boolean
   handleValidationOpenDialog: () => void
   handleValidationCloseDialog: () => void
   shouldShowAlertIndicatorOnTab: Record<TAB_VALUES, boolean>
   shouldShowAlertIndicator: boolean
   isGeneralTabInvalid: boolean
   isCFAdmin: boolean
   group: Group
   author: AuthorInfo
}

const OfflineEventCreationContext = createContext<
   OfflineEventCreationContextType | undefined
>(undefined)

type OfflineEventCreationContextProviderType = {
   offlineEvent: OfflineEvent
   group: Group
   children: ReactNode
}

export const OfflineEventCreationContextProvider = ({
   offlineEvent,
   group,
   children,
}: OfflineEventCreationContextProviderType) => {
   const { userData } = useAuth()
   const { values, validateForm } = useOfflineEventFormValues()

   const {
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
   } = useTabNavigationAndValidation(values.general)

   const targetOfflineEventCollection: OfflineEventCreationContextType["targetOfflineEventCollection"] =
      "offlineEvents"

   const isCFAdmin = userData?.isAdmin

   const value = useMemo(() => {
      const author: AuthorInfo = {
         groupId: group.id,
         authUid: userData?.authId,
      }

      return {
         offlineEvent,
         targetOfflineEventCollection,
         tabToNavigateTo,
         tabValue,
         setTabValue,
         navPreviousTab,
         navNextTab,
         navigateWithValidationCheck,
         isValidationDialogOpen,
         handleValidationOpenDialog,
         handleValidationCloseDialog,
         shouldShowAlertIndicatorOnTab,
         shouldShowAlertIndicator,
         isGeneralTabInvalid,
         isCFAdmin,
         group,
         author,
      }
   }, [
      offlineEvent,
      group,
      userData?.authId,
      tabToNavigateTo,
      tabValue,
      setTabValue,
      navPreviousTab,
      navNextTab,
      navigateWithValidationCheck,
      isValidationDialogOpen,
      handleValidationOpenDialog,
      handleValidationCloseDialog,
      shouldShowAlertIndicatorOnTab,
      shouldShowAlertIndicator,
      isGeneralTabInvalid,
      isCFAdmin,
   ])

   // this is needed because isValid is true on first load
   useEffectOnce(() => {
      validateForm(values)
   })

   return (
      <OfflineEventCreationContext.Provider value={value}>
         {children}
      </OfflineEventCreationContext.Provider>
   )
}

export const useOfflineEventCreationContext = () => {
   const context = useContext(OfflineEventCreationContext)
   if (context === undefined) {
      throw new Error(
         "useOfflineEventCreationContext must be used within an OfflineEventCreationContextProvider"
      )
   }
   return context
}
