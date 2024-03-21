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

type LivestreamCreationContextType = {
   tabValue: TAB_VALUES
   setTabValue: Dispatch<SetStateAction<TAB_VALUES>>
   navPreviousTab: () => void
   navNextTab: () => void
   navigateWithValidationCheck: (callback: () => void) => void
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
   const { errors } = useLivestreamFormValues()
   const [tabValue, setTabValue] = useState<TAB_VALUES>(TAB_VALUES.GENERAL)
   const [alertState, setAlertState] = useState(undefined)
   const [isNavigatingForward, setIsNavigatingForward] = useState(true)
   const [
      isValidationDialogOpen,
      handleValidationOpenDialog,
      handleValidationCloseDialog,
   ] = useDialogStateHandler()

   const shouldShowAlertIndicatorOnTab = useMemo(
      () => ({
         [TAB_VALUES.GENERAL]:
            alertState !== undefined && Boolean(errors.general),
         [TAB_VALUES.SPEAKERS]:
            alertState !== undefined && Boolean(errors.speakers),
      }),
      [alertState, errors.general, errors.speakers]
   )

   const formHasCriticalValidationErrors = Boolean(
      errors.general || errors.speakers
   )

   const shouldShowAlertIndicator =
      alertState !== undefined && formHasCriticalValidationErrors
   const shouldShowAlertDialog =
      (alertState === true || alertState == undefined) &&
      formHasCriticalValidationErrors

   const navigateWithValidationCheck = useCallback(
      (navigationCallback: () => void) => {
         if (shouldShowAlertDialog) {
            setAlertState(true)
            handleValidationOpenDialog()
            return
         }
         navigationCallback()
      },
      [handleValidationOpenDialog, shouldShowAlertDialog]
   )

   const navPreviousTab = useCallback(() => {
      navigateWithValidationCheck(() => {
         if (tabValue !== TAB_VALUES.GENERAL) {
            setTabValue(tabValue - 1)
            setIsNavigatingForward(false)
         }
      })
   }, [navigateWithValidationCheck, tabValue])

   const navNextTab = useCallback(() => {
      navigateWithValidationCheck(() => {
         if (tabValue !== MAX_TAB_VALUE) {
            setTabValue(tabValue + 1)
            setIsNavigatingForward(true)
         }
      })
   }, [navigateWithValidationCheck, tabValue])

   const value = useMemo(
      () => ({
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
         "useLivestreamTab must be used within a LivestreamTabProvider"
      )
   }
   return context
}
