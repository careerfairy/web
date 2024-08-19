import {
   LivestreamMode,
   LivestreamModes,
} from "@careerfairy/shared-lib/livestreams"
import { MenuProps } from "@mui/material"
import { PDFIcon, ShareScreenIcon } from "components/views/common/icons"

import { useAppDispatch } from "components/custom-hook/store"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import { useDeleteLivestreamVideo } from "components/custom-hook/streaming/video/useDeleteLivestreamVideo"
import BrandedResponsiveMenu, {
   MenuOption,
} from "components/views/common/inputs/BrandedResponsiveMenu"
import { Youtube } from "react-feather"
import {
   setShareVideoDialogOpen,
   setUploadPDFPresentationDialogOpen,
} from "store/reducers/streamingAppReducer"
import { useLivestreamMode } from "store/selectors/streamingAppSelectors"
import { useStreamingContext } from "../../context"
import { useScreenShare } from "../../context/ScreenShare"

type Props = MenuProps & {
   handleClose: () => void
}

export const ShareMenu = ({ handleClose, open, anchorEl }: Props) => {
   const dispatch = useAppDispatch()
   const { handleStopScreenShare, handleStartScreenShareProcess } =
      useScreenShare()
   const { livestreamId } = useStreamingContext()
   const { trigger: setLivestreamMode } = useSetLivestreamMode(livestreamId)
   const { trigger: deleteLivestreamVideo } =
      useDeleteLivestreamVideo(livestreamId)

   const mode = useLivestreamMode()

   const screenShareActive = mode === LivestreamModes.DESKTOP
   const PDFActive = mode === LivestreamModes.PRESENTATION
   const videoActive = mode === LivestreamModes.VIDEO

   const handleToggleMode = (newMode: LivestreamMode, active: boolean) => {
      switch (newMode) {
         case LivestreamModes.DESKTOP:
            if (active) {
               handleStopScreenShare()
            } else {
               handleStartScreenShareProcess()
            }
            break
         case LivestreamModes.PRESENTATION:
            if (active) {
               setLivestreamMode({ mode: LivestreamModes.DEFAULT })
            } else {
               dispatch(setUploadPDFPresentationDialogOpen(true))
            }
            break
         case LivestreamModes.VIDEO:
            if (active) {
               setLivestreamMode({ mode: LivestreamModes.DEFAULT })
               deleteLivestreamVideo()
            } else {
               dispatch(setShareVideoDialogOpen(true))
            }
            break
         default:
            break
      }

      handleClose()
   }

   const options: MenuOption[] = [
      {
         label: PDFActive ? "Stop sharing PDF" : "Share PDF presentation",
         icon: <PDFIcon />,
         handleClick: () =>
            handleToggleMode(LivestreamModes.PRESENTATION, PDFActive),
      },
      {
         label: videoActive ? "Stop sharing video" : "Share video",
         icon: <Youtube />,
         handleClick: () =>
            handleToggleMode(LivestreamModes.VIDEO, videoActive),
      },
      {
         label: screenShareActive ? "Stop sharing screen" : "Share screen",
         icon: <ShareScreenIcon />,
         handleClick: () =>
            handleToggleMode(LivestreamModes.DESKTOP, screenShareActive),
      },
   ]

   return (
      <BrandedResponsiveMenu
         placement="top"
         handleClose={handleClose}
         open={open}
         anchorEl={anchorEl as HTMLElement}
         options={options}
      />
   )
}

ShareMenu.displayName = "ShareMenu"
