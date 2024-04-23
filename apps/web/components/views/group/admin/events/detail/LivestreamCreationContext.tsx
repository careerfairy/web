import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useAuth } from "HOCs/AuthProvider"
import { TAB_VALUES } from "components/views/group/admin/events/detail/form/commons"
import {
   Dispatch,
   ReactNode,
   SetStateAction,
   createContext,
   useContext,
   useMemo,
} from "react"
import { useEffectOnce } from "react-use"
import { useLivestreamFormValues } from "./form/useLivestreamFormValues"
import { useTabNavigationAndValidation } from "./navigation/useTabNavigationAndValidation"

type LivestreamCreationContextType = {
   livestream: LivestreamEvent
   targetLivestreamCollection: "livestreams" | "draftLivestreams"
   tabToNavigateTo: TAB_VALUES
   tabValue: TAB_VALUES
   setTabValue: Dispatch<SetStateAction<TAB_VALUES>>
   navPreviousTab: () => void
   navNextTab: () => void
   navigateWithValidationCheck: (newTabValue: TAB_VALUES) => void
   setAlertState: Dispatch<SetStateAction<boolean>>
   isValidationDialogOpen: boolean
   handleValidationOpenDialog: () => void
   handleValidationCloseDialog: () => void
   shouldShowAlertIndicatorOnTab: Record<
      TAB_VALUES.GENERAL | TAB_VALUES.SPEAKERS,
      boolean
   >
   shouldShowAlertIndicator: boolean
   isGeneralTabInvalid: boolean
   isSpeakerTabInvalid: boolean
   isCohostedEvent: boolean
   isCFAdmin: boolean
}

const LivestreamCreationContext = createContext<
   LivestreamCreationContextType | undefined
>(undefined)

type LivestreamCreationContextProviderType = {
   livestream: LivestreamEvent
   group: Group
   children: ReactNode
}

export const LivestreamCreationContextProvider = ({
   livestream,
   group,
   children,
}: LivestreamCreationContextProviderType) => {
   const { userData } = useAuth()
   const { values, validateForm } = useLivestreamFormValues()

   const {
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
   } = useTabNavigationAndValidation(values.general, values.speakers)

   const targetLivestreamCollection: LivestreamCreationContextType["targetLivestreamCollection"] =
      livestream.isDraft ? "draftLivestreams" : "livestreams"

   const isCohostedEvent = Boolean(
      livestream?.groupIds.length > 1 || group?.universityCode
   )
   const isCFAdmin = userData?.isAdmin

   const value = useMemo(
      () => ({
         livestream,
         targetLivestreamCollection,
         tabToNavigateTo,
         tabValue,
         setTabValue,
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
         isCohostedEvent,
         isCFAdmin,
      }),
      [
         livestream,
         targetLivestreamCollection,
         tabToNavigateTo,
         tabValue,
         setTabValue,
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
         isCohostedEvent,
         isCFAdmin,
      ]
   )

   // this is needed becase isValid is true on first load
   useEffectOnce(() => {
      validateForm(values)
   })

   return (
      <LivestreamCreationContext.Provider value={value}>
         {children}
      </LivestreamCreationContext.Provider>
   )
}

export const useLivestreamCreationContext = () => {
   const context = useContext(LivestreamCreationContext)
   if (context === undefined) {
      throw new Error(
         "useLivestreamCreationContext must be used within a LivestreamCreationContextProvider"
      )
   }
   return context
}
