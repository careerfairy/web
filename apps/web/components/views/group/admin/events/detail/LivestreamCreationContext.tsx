import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import {
   MAX_TAB_VALUE,
   TAB_VALUES,
} from "components/views/group/admin/events/detail/form/commons"
import {
   Dispatch,
   FC,
   ReactNode,
   SetStateAction,
   createContext,
   useCallback,
   useContext,
   useMemo,
   useState,
} from "react"
import { useLivestreamFormValues } from "./form/useLivestreamFormValues"
import {
   livestreamFormGeneralTabSchema,
   livestreamFormSpeakersTabSchema,
} from "./form/validationSchemas"

type LivestreamCreationContextType = {
   tabToNavigateTo: TAB_VALUES
   tabValue: TAB_VALUES
   setTabValue: Dispatch<SetStateAction<TAB_VALUES>>
   navPreviousTab: () => void
   navNextTab: () => void
   navigateWithValidationCheck: (newTabValue: TAB_VALUES) => void
   isNavigatingForward: boolean
   alertState: boolean
   setAlertState: Dispatch<SetStateAction<boolean>>
   isValidationDialogOpen: boolean
   handleValidationOpenDialog: () => void
   handleValidationCloseDialog: () => void
   shouldShowAlertIndicatorOnTab: Record<
      TAB_VALUES.GENERAL | TAB_VALUES.SPEAKERS,
      boolean
   >
   shouldShowAlertDialog: boolean
   shouldShowAlertIndicator: boolean
   isGenralTabInvalid: boolean
   isSpeakerTabInvalid: boolean
}

const LivestreamCreationContext = createContext<
   LivestreamCreationContextType | undefined
>(undefined)

type LivestreamCreationContextProviderType = {
   children: ReactNode
}

export const LivestreamCreationContextProvider: FC<
   LivestreamCreationContextProviderType
> = ({ children }) => {
   const {
      values: { general, speakers },
   } = useLivestreamFormValues()
   const [tabValue, setTabValue] = useState<TAB_VALUES>(TAB_VALUES.GENERAL)
   const [alertState, setAlertState] = useState(undefined)
   const [isNavigatingForward, setIsNavigatingForward] = useState(true)
   const [tabToNavigateTo, setTabToNavigateTo] = useState<TAB_VALUES>(undefined)
   const [
      isValidationDialogOpen,
      handleValidationOpenDialog,
      handleValidationCloseDialog,
   ] = useDialogStateHandler()

   const isGenralTabInvalid =
      !livestreamFormGeneralTabSchema.isValidSync(general)
   const isSpeakerTabInvalid = !livestreamFormSpeakersTabSchema.isValidSync(
      speakers.values
   )
   const formHasCriticalValidationErrors =
      isGenralTabInvalid || isSpeakerTabInvalid

   const shouldShowAlertIndicatorOnTab = useMemo(
      () => ({
         [TAB_VALUES.GENERAL]: alertState !== undefined && isGenralTabInvalid,
         [TAB_VALUES.SPEAKERS]: alertState !== undefined && isSpeakerTabInvalid,
      }),
      [alertState, isGenralTabInvalid, isSpeakerTabInvalid]
   )

   const shouldShowAlertIndicator =
      alertState !== undefined && formHasCriticalValidationErrors

   const shouldShowAlertDialog =
      (alertState === true || alertState == undefined) &&
      formHasCriticalValidationErrors

   const navigateWithValidationCheck = useCallback(
      (newTabValue) => {
         if (shouldShowAlertDialog) {
            setAlertState(true)
            handleValidationOpenDialog()
            setTabToNavigateTo(newTabValue)
         } else {
            setTabValue(newTabValue)
         }
      },
      [handleValidationOpenDialog, shouldShowAlertDialog]
   )

   const navPreviousTab = useCallback(() => {
      if (tabValue !== TAB_VALUES.GENERAL) {
         setIsNavigatingForward(false)
         navigateWithValidationCheck(tabValue - 1)
      }
   }, [navigateWithValidationCheck, tabValue])

   const navNextTab = useCallback(() => {
      if (tabValue !== MAX_TAB_VALUE) {
         setIsNavigatingForward(true)
         navigateWithValidationCheck(tabValue + 1)
      }
   }, [navigateWithValidationCheck, tabValue])

   const value = useMemo(
      () => ({
         tabToNavigateTo,
         tabValue,
         setTabValue,
         navPreviousTab,
         navNextTab,
         navigateWithValidationCheck,
         isNavigatingForward,
         alertState,
         setAlertState,
         isValidationDialogOpen,
         handleValidationOpenDialog,
         handleValidationCloseDialog,
         shouldShowAlertIndicatorOnTab,
         shouldShowAlertDialog,
         shouldShowAlertIndicator,
         isGenralTabInvalid,
         isSpeakerTabInvalid,
      }),
      [
         shouldShowAlertDialog,
         shouldShowAlertIndicator,
         shouldShowAlertIndicatorOnTab,
         handleValidationCloseDialog,
         handleValidationOpenDialog,
         isValidationDialogOpen,
         navigateWithValidationCheck,
         navNextTab,
         navPreviousTab,
         isNavigatingForward,
         alertState,
         tabValue,
         tabToNavigateTo,
         isGenralTabInvalid,
         isSpeakerTabInvalid,
      ]
   )

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
