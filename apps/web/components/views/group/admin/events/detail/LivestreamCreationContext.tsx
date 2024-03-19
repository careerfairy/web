import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { TAB_VALUES } from "components/views/group/admin/events/detail/form/commons"
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
   tabNavigation: (callback: () => void) => void
   alertState: boolean
   setAlertState: Dispatch<SetStateAction<boolean>>
   isValidationDialogOpen: boolean
   handleValidationOpenDialog: () => void
   handleValidationCloseDialog: () => void
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
   const [
      isValidationDialogOpen,
      handleValidationOpenDialog,
      handleValidationCloseDialog,
   ] = useDialogStateHandler()

   const formHasCriticalValidationErrors = Boolean(
      errors.general || errors.speakers
   )

   const shouldShowAlertIndicator =
      alertState !== undefined && formHasCriticalValidationErrors
   const shouldShowAlertDialog =
      (alertState === true || alertState == undefined) &&
      formHasCriticalValidationErrors

   const tabNavigation = useCallback(
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
      tabNavigation(() => {
         if (tabValue !== TAB_VALUES.GENERAL) {
            setTabValue(tabValue - 1)
         }
      })
   }, [tabNavigation, tabValue])

   const navNextTab = useCallback(() => {
      tabNavigation(() => {
         if (tabValue !== TAB_VALUES.JOBS) {
            setTabValue(tabValue + 1)
         }
      })
   }, [tabNavigation, tabValue])

   const value = useMemo(
      () => ({
         tabValue,
         setTabValue,
         navPreviousTab,
         navNextTab,
         tabNavigation,
         alertState,
         setAlertState,
         isValidationDialogOpen,
         handleValidationOpenDialog,
         handleValidationCloseDialog,
         shouldShowAlertDialog,
         shouldShowAlertIndicator,
      }),
      [
         shouldShowAlertDialog,
         shouldShowAlertIndicator,
         handleValidationCloseDialog,
         handleValidationOpenDialog,
         isValidationDialogOpen,
         tabNavigation,
         navNextTab,
         navPreviousTab,
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
