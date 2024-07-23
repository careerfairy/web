import useLivestreamSecureTokenSWR from "components/custom-hook/live-stream/useLivestreamSecureToken"
import useMenuState from "components/custom-hook/useMenuState"
import { appendCurrentQueryParams } from "components/util/url"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { SpyIcon } from "components/views/streaming-page/components/TopBar/SpyIcon"
import { useRouter } from "next/router"
import { forwardRef, useCallback, useState } from "react"
import { PlayCircle, StopCircle, Tool, UserPlus } from "react-feather"
import {
   useHasStarted,
   useIsSpyMode,
} from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../../context"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import {
   ConfirmDialogState,
   ToggleStartLiveStreamDialog,
} from "../TopBar/ToggleStartLiveStreamDialog"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

export const AdminControlsButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { push, query, pathname } = useRouter()
   const { livestreamId, isHost } = useStreamingContext()
   const token = useLivestreamSecureTokenSWR(livestreamId)
   const hasStarted = useHasStarted()
   const isSpyMode = useIsSpyMode()

   const { anchorEl, handleClick, handleClose } = useMenuState()
   const isMenuOpen = Boolean(anchorEl)

   const [dialogState, setDialogState] = useState<ConfirmDialogState>({
      isDialogOpen: false,
      intent: "start-streaming",
   })

   const shouldStop = dialogState.intent === "stop-streaming"

   const handleCloseDialog = useCallback(() => {
      setDialogState((prev) => ({ ...prev, isDialogOpen: false }))
   }, [])

   const options: MenuOption[] = [
      {
         label: `Join as ${isHost ? "viewer" : "streamer"}`,
         icon: <UserPlus />,
         handleClick: () => {
            push(
               appendCurrentQueryParams(
                  isHost
                     ? `/streaming/viewer/${livestreamId}`
                     : `/streaming/host/${livestreamId}?token=${token?.data?.value}`,
                  ["token"]
               )
            )
         },
      },
      {
         label: `${isSpyMode ? "Disable" : "Enable"} spy mode`,
         icon: <SpyIcon enabled={!isSpyMode} />,
         handleClick: async () => {
            const newQuery = { ...query }
            isSpyMode ? delete newQuery.spy : (newQuery.spy = "true")
            push({
               pathname,
               query: newQuery,
            })
         },
      },
      {
         label: `${hasStarted ? "Stop" : "Start"} stream`,
         icon: hasStarted ? <StopCircle /> : <PlayCircle />,
         handleClick: () => {
            setDialogState({
               isDialogOpen: true,
               intent: hasStarted ? "stop-streaming" : "start-streaming",
            })
         },
         color: hasStarted ? "error.main" : "",
      },
   ]

   return (
      <>
         <BrandedTooltip title={enableTooltip ? ActionTooltips.Admin : null}>
            <ActionBarButtonStyled
               onClick={handleClick}
               active={isMenuOpen}
               ref={ref}
               {...props}
            >
               <Tool />
            </ActionBarButtonStyled>
         </BrandedTooltip>
         <BrandedResponsiveMenu
            options={options}
            open={isMenuOpen}
            handleClose={handleClose}
            anchorEl={anchorEl}
            placement="top"
         />
         <ToggleStartLiveStreamDialog
            shouldStop={shouldStop}
            open={Boolean(dialogState.isDialogOpen)}
            handleCloseDialog={handleCloseDialog}
         />
      </>
   )
})
AdminControlsButton.displayName = "AdminControlsButton"
