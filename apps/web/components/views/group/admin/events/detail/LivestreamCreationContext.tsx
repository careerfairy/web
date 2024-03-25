import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
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
   livestream: LivestreamEvent
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
   isUniversityEvent: boolean // edge case where university cohost events with companies
   isCohostedEvent: boolean
}

const LivestreamCreationContext = createContext<
  LivestreamCreationContextType | undefined
>(undefined)

type LivestreamCreationContextProviderType = {
  livestream: LivestreamEvent
  group: Group
  children: ReactNode
}

export const LivestreamCreationContextProvider: FC<
  LivestreamCreationContextProviderType
> = ({ livestream, group, children }) => {
  const {
    values: { general, speakers },
  } = useLivestreamFormValues()
  const [tabValue, setTabValue] = useState<TAB_VALUES>(TAB_VALUES.GENERAL)
  const [isNavigatingForward, setIsNavigatingForward] = useState(true)
  const [tabToNavigateTo, setTabToNavigateTo] = useState<TAB_VALUES>(undefined)
  const [tabsVisited, setTabsVisited] = useState<Record<TAB_VALUES, boolean>>({
    [TAB_VALUES.GENERAL]: true,
    [TAB_VALUES.SPEAKERS]: false,
    [TAB_VALUES.QUESTIONS]: false,
    [TAB_VALUES.JOBS]: false,
  })

  const [alertState, setAlertState] = useState(undefined)

  const [
    isValidationDialogOpen,
    handleValidationOpenDialog,
    handleValidationCloseDialog,
  ] = useDialogStateHandler()

  const isGenralTabInvalid =
    !livestreamFormGeneralTabSchema.isValidSync(general) &&
    tabsVisited[TAB_VALUES.GENERAL]
  const isSpeakerTabInvalid =
    !livestreamFormSpeakersTabSchema.isValidSync(speakers) &&
    tabsVisited[TAB_VALUES.SPEAKERS]
  const formHasCriticalValidationErrors =
    isGenralTabInvalid || isSpeakerTabInvalid

  const isUniversityEvent = Boolean(group?.universityCode)
  const isCohostedEvent = Boolean(livestream.groupIds.length > 1)

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

      if (!tabsVisited[tabValue]) {
        setTabsVisited((prev) => ({ ...prev, [tabValue]: true }))
      }
    },
    [handleValidationOpenDialog, shouldShowAlertDialog, tabValue, tabsVisited]
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
      livestream,
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
      isUniversityEvent,
      isCohostedEvent,
    }),
    [
      isCohostedEvent,
      isUniversityEvent,
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
      livestream,
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
