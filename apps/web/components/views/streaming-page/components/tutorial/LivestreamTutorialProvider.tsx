import {
   useActiveSidePanelView,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import { useToggleHandRaise } from "components/custom-hook/streaming/hand-raise/useToggleHandRaise"
import {
   createContext,
   ReactNode,
   useContext,
   useEffect,
   useMemo,
   useReducer,
} from "react"
import Joyride, {
   CallBackProps,
   Events,
   EVENTS,
   Status,
   STATUS,
} from "react-joyride"
import { ActiveViews } from "store/reducers/streamingAppReducer"
import {
   useIsTestLivestream,
   useStreamHandRaiseEnabled,
} from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../../context"
import {
   EndTutorialDialog,
   SkipConfirmationDialog,
   StartTutorialDialog,
} from "./TutorialDialogs"
import { TutorialStepCard } from "./TutorialStepCard"
import { TutorialSteps, TutorialStepsInfo } from "./TutorialSteps"

export enum TutorialActionEnum {
   SHOW_START,
   SHOW_END,
   SHOW_SKIP,
   START_TUTORIAL,
   END_TUTORIAL,
   CONFIRM_SKIP,
   NEXT_STEP,
   WAIT,
   RESUME,
   NEW_STEP,
}

type TutorialState = {
   startDialogOpen: boolean
   endDialogOpen: boolean
   skipDialogOpen: boolean
   isActive: boolean
   activeStep: number
   activeStepId: string
   lastStepData: CallBackProps
   isWaiting: boolean
}

type TutorialAction =
   | { type: TutorialActionEnum.START_TUTORIAL }
   | { type: TutorialActionEnum.NEXT_STEP }
   | { type: TutorialActionEnum.SHOW_END }
   | { type: TutorialActionEnum.SHOW_SKIP }
   | { type: TutorialActionEnum.WAIT }
   | { type: TutorialActionEnum.RESUME }
   | { type: TutorialActionEnum.END_TUTORIAL }
   | { type: TutorialActionEnum.CONFIRM_SKIP }
   | { type: TutorialActionEnum.SHOW_START }
   | { type: TutorialActionEnum.NEW_STEP; payload: CallBackProps }

const reducer = (
   state: TutorialState,
   action: TutorialAction
): TutorialState => {
   switch (action.type) {
      case TutorialActionEnum.START_TUTORIAL:
         return {
            ...state,
            startDialogOpen: false,
            skipDialogOpen: false,
            isActive: true,
         }
      case TutorialActionEnum.NEXT_STEP:
         return {
            ...state,
            activeStep: state.activeStep + 1,
            activeStepId:
               TutorialStepsInfo[state.activeStep + 1]?.data?.id || null,
         }
      case TutorialActionEnum.SHOW_END:
         return {
            ...state,
            endDialogOpen: true,
            isActive: false,
         }
      case TutorialActionEnum.SHOW_SKIP:
         return {
            ...state,
            startDialogOpen: false,
            skipDialogOpen: true,
         }
      case TutorialActionEnum.WAIT:
         return {
            ...state,
            isWaiting: true,
         }
      case TutorialActionEnum.RESUME:
         return {
            ...state,
            isWaiting: false,
         }
      case TutorialActionEnum.CONFIRM_SKIP:
         return {
            ...state,
            skipDialogOpen: false,
            isActive: false,
         }
      case TutorialActionEnum.END_TUTORIAL:
         return {
            ...state,
            endDialogOpen: false,
         }
      case TutorialActionEnum.NEW_STEP:
         return {
            ...state,
            lastStepData: action.payload,
         }
      case TutorialActionEnum.SHOW_START:
         return {
            ...state,
            startDialogOpen: true,
         }
      default:
         return state
   }
}

type TutorialContextType = {
   isActive: boolean
   activeStepId: string
   handleSkipTutorial: () => void
   isWaiting: boolean
}

const TutorialContext = createContext<TutorialContextType | undefined>(
   undefined
)

type Props = {
   children: ReactNode
}

export const LivestreamTutorialProvider = ({ children }: Props) => {
   const isTestStream = useIsTestLivestream()
   const isLivestreamMobile = useStreamIsMobile()
   const { isHost, livestreamId, streamerAuthToken, isReady } =
      useStreamingContext()
   const { handleSetActive: toggleQAndAPanel, isActive: isQAndAPanelOpen } =
      useActiveSidePanelView(ActiveViews.QUESTIONS)
   const {
      handleSetActive: toggleHandRaisePanel,
      isActive: isHandRaisePanelOpen,
   } = useActiveSidePanelView(ActiveViews.HAND_RAISE)
   const { handleSetActive: togglePollsPanel, isActive: isPollsPanelOpen } =
      useActiveSidePanelView(ActiveViews.POLLS)
   const handRaiseEnabled = useStreamHandRaiseEnabled()
   const { trigger: toggleHandRaise, isMutating } = useToggleHandRaise(
      livestreamId,
      streamerAuthToken
   )

   const [tutorialState, dispatch] = useReducer(reducer, {
      startDialogOpen: isTestStream && isHost && isReady,
      endDialogOpen: false,
      skipDialogOpen: false,
      isActive: false,
      activeStep: 0,
      activeStepId: TutorialStepsInfo[0].data?.id,
      lastStepData: null,
      isWaiting: false,
   })

   const wait = () => {
      dispatch({ type: TutorialActionEnum.WAIT })
   }

   const resume = () => {
      dispatch({ type: TutorialActionEnum.RESUME })
   }

   useEffect(() => {
      if (isTestStream && isHost && isReady && !isLivestreamMobile) {
         dispatch({ type: TutorialActionEnum.SHOW_START })
      }
   }, [isReady, isHost, isTestStream, isLivestreamMobile])

   useEffect(() => {
      const check = async () => {
         if (
            isQAndAPanelOpen ||
            isHandRaisePanelOpen ||
            isPollsPanelOpen ||
            handRaiseEnabled
         ) {
            // wait for animations to complete
            await new Promise((resolve) => setTimeout(resolve, 200))
            resume()
         }
      }
      check()
   }, [
      isQAndAPanelOpen,
      isHandRaisePanelOpen,
      isPollsPanelOpen,
      handRaiseEnabled,
   ])

   useEffect(() => {
      const check = async () => {
         if (isMutating) {
            !tutorialState.isWaiting && wait()
         } else {
            // wait for animations to complete
            await new Promise((resolve) => setTimeout(resolve, 200))
            resume()
         }
      }
      check()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isMutating])

   useEffect(() => {
      // resume tutorial after actions are performed
      if (!tutorialState.isWaiting && tutorialState.lastStepData) {
         handleJoyrideCallback(tutorialState.lastStepData)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [tutorialState.isWaiting])

   const handleJoyrideCallback = (data: CallBackProps) => {
      const { status, type, step } = data

      dispatch({ type: TutorialActionEnum.NEW_STEP, payload: data })

      const stepId = step?.data?.id

      if (
         ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as Events[]).includes(
            type
         )
      ) {
         // actions to perform before running step
         if (stepId === TutorialSteps.Q_AND_A_1 && !isQAndAPanelOpen) {
            wait()
            return toggleQAndAPanel()
         } else if (
            stepId === TutorialSteps.HAND_RAISE_1 &&
            !isHandRaisePanelOpen
         ) {
            wait()
            return toggleHandRaisePanel()
         } else if (
            stepId === TutorialSteps.HAND_RAISE_2 &&
            !handRaiseEnabled
         ) {
            wait()
            return toggleHandRaise()
         } else if (stepId === TutorialSteps.POLLS_1 && !isPollsPanelOpen) {
            wait()
            return togglePollsPanel()
         }

         // clean up
         if (stepId === TutorialSteps.Q_AND_A_3) toggleQAndAPanel()
         else if (stepId == TutorialSteps.HAND_RAISE_3) {
            toggleHandRaise()
            toggleHandRaisePanel()
         } else if (stepId === TutorialSteps.POLLS_3) togglePollsPanel()

         dispatch({ type: TutorialActionEnum.NEXT_STEP })
      } else if (([STATUS.FINISHED] as Status[]).includes(status)) {
         dispatch({ type: TutorialActionEnum.SHOW_END })
      }
   }

   const value = useMemo<TutorialContextType>(
      () => ({
         isActive: tutorialState.isActive,
         activeStepId: tutorialState.activeStepId,
         handleSkipTutorial: () =>
            dispatch({ type: TutorialActionEnum.SHOW_SKIP }),
         isWaiting: tutorialState.isWaiting,
      }),
      [tutorialState]
   )
   return (
      <TutorialContext.Provider value={value}>
         <Joyride
            run={tutorialState.isActive}
            steps={TutorialStepsInfo}
            callback={handleJoyrideCallback}
            disableCloseOnEsc
            disableOverlayClose
            disableScrolling
            disableScrollParentFix
            styles={{
               overlay: { backgroundColor: "rgba(0, 0, 0, 0.10)" },
               spotlight: { borderRadius: "60px" },
            }}
            spotlightPadding={6}
            tooltipComponent={TutorialStepCard}
            stepIndex={tutorialState.activeStep}
         />
         {children}
         <StartTutorialDialog
            open={tutorialState.startDialogOpen}
            handleStart={() =>
               dispatch({ type: TutorialActionEnum.START_TUTORIAL })
            }
            handleSkip={() => dispatch({ type: TutorialActionEnum.SHOW_SKIP })}
         />
         <SkipConfirmationDialog
            open={tutorialState.skipDialogOpen}
            handleSkip={() =>
               dispatch({ type: TutorialActionEnum.CONFIRM_SKIP })
            }
            handleStart={() =>
               dispatch({ type: TutorialActionEnum.START_TUTORIAL })
            }
         />

         <EndTutorialDialog
            open={tutorialState.endDialogOpen}
            handleClose={() =>
               dispatch({ type: TutorialActionEnum.END_TUTORIAL })
            }
         />
      </TutorialContext.Provider>
   )
}

export const useLivestreamTutorial = () => {
   const context = useContext(TutorialContext)
   if (!context) {
      throw new Error(
         "useLivestreamTutorial must be used within a TutorialProvider"
      )
   }
   return context
}
