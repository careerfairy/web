import React, {
   ComponentProps,
   FC,
   memo,
   useCallback,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions"
import RootState from "store/reducers"
import { ConnectionState } from "agora-rtc-sdk-ng"
import ConnectionStateModal from "./ModalViews/ConnectionStateModal"
import DebugModal from "./ModalViews/DebugModal"
import UidConflict from "./ModalViews/UidConflict"
import { rtcMessages } from "types/streaming"
import { AlertProps } from "@mui/material/Alert/Alert"
import { useRouter } from "next/router"
import ScreenShareDeniedModal from "./ModalViews/ScreenShareDeniedModal"
import { animateProfileIcon } from "../../../../../store/actions/streamActions"
import { ANIMATE_PROFILE_ICON_AFTER_MS } from "../../../../../constants/streams"
import { rtcConnectionStateSelector } from "../../../../../store/selectors/streamSelectors"
import { StepCard } from "./common/StepsView"

interface Props {}
type Step = ComponentProps<typeof StepCard>

const AgoraStateHandler: FC<Props> = () => {
   const dispatch = useDispatch()
   const router = useRouter()

   const [view, setView] = useState(null)
   const agoraRtcConnectionStatus = useSelector(rtcConnectionStateSelector)
   const agoraRtcError = useSelector((state: RootState) => {
      return state.stream.agoraState.rtcError
   })

   const networkErrorStep: Step = useMemo(
      () => ({
         description: "Sometimes a simple refresh might resolve the issue.",
         actionButtonProps: {
            children: "Refresh",
            onClick: router.reload,
            variant: "contained",
            color: "secondary",
         },
         title: "Try Refreshing",
      }),
      [router.reload]
   )

   const steps: Step[] = useMemo(
      () => [
         {
            title: "Change Network",
            description:
               "Try disconnecting from any VPN, switching to another " +
               "network or use a mobile hotspot. and click refresh once done.",
            actionButtonProps: {
               onClick: router.reload,
               children: "Refresh",
               variant: "contained",
               color: "secondary",
            },
         },
      ],
      [router.reload]
   )

   const sendRTCSateToast = useCallback(
      (
         rtcStatus: ConnectionState,
         variant: AlertProps["severity"],
         persist?: boolean
      ) => {
         dispatch(
            actions.enqueueSnackbar({
               message: rtcMessages[rtcStatus],
               options: {
                  variant: variant,
                  preventDuplicate: true,
                  key: rtcStatus,
                  persist: Boolean(persist),
               },
            })
         )
      },
      [dispatch]
   )

   const showConnectionStateModal = useCallback(
      (additionalSteps?: Step[]) =>
         setView(() => (
            <ConnectionStateModal
               steps={additionalSteps ? [...additionalSteps, ...steps] : steps}
            />
         )),
      [steps]
   )

   const showDebugModal = useCallback(
      () => setView(() => <DebugModal steps={steps} />),
      [steps]
   )
   const showUidConflictModal = useCallback(
      () => setView(() => <UidConflict />),
      []
   )

   const sendConnectedToast = useCallback(() => {
      sendRTCSateToast("CONNECTED", "success")
   }, [sendRTCSateToast])

   const closeToast = useCallback(
      (key: ConnectionState) => {
         dispatch(actions.closeSnackbar(key))
      },
      [dispatch]
   )

   useEffect(() => {
      ;(function handleStatus() {
         const { prevState, curState, reason } = agoraRtcConnectionStatus

         if (reason === "LEAVE") return
         switch (curState) {
            case "CONNECTED":
               closeToast(prevState)
               sendConnectedToast()
               setView(null)

               setTimeout(() => {
                  void dispatch(animateProfileIcon())
               }, ANIMATE_PROFILE_ICON_AFTER_MS)
               break
            case "RECONNECTING":
               if (prevState === "CONNECTED") {
                  showConnectionStateModal()
               }
               break
            case "CONNECTING":
               showConnectionStateModal()
               break
            case "DISCONNECTED":
               if (reason === "NETWORK_ERROR") {
                  return showConnectionStateModal([networkErrorStep])
               }
               if (prevState === "CONNECTING") return
               if (reason === "UID_BANNED") {
                  return showUidConflictModal()
               }
               showConnectionStateModal()
               break
            case "DISCONNECTING":
               setView(null)
               break
            default:
               setView(null)
               break
         }

         return () => {
            closeToast(curState)
            setView(null)
         }
      })()
   }, [
      agoraRtcConnectionStatus,
      closeToast,
      dispatch,
      networkErrorStep,
      sendConnectedToast,
      showConnectionStateModal,
      showUidConflictModal,
   ])

   useEffect(() => {
      ;(function handleError() {
         switch (agoraRtcError?.code) {
            case "FAILED_TO_SUBSCRIBE_WITH_PROXY":
               showDebugModal()
               break
            case "FAILED_TO_SUBSCRIBE_WITHOUT_PROXY":
               showDebugModal()
               break
            case "UID_CONFLICT":
               showUidConflictModal()
               break
            default:
               return null
         }
      })()
   }, [agoraRtcError?.code, showDebugModal, showUidConflictModal])

   return (
      <>
         {view || null}
         {<ScreenShareDeniedModal />}
      </>
   )
}

export default memo(AgoraStateHandler)
