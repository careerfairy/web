import {
   LivestreamMode,
   LivestreamModes,
} from "@careerfairy/shared-lib/livestreams"
import { MenuItem, MenuProps, Typography } from "@mui/material"
import { useCurrentUID } from "agora-rtc-react"
import { useLivestreamData } from "components/custom-hook/streaming"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import {
   PDFIcon,
   ShareScreenIcon,
   VideoIcon,
} from "components/views/common/icons"
import BrandedMenu from "components/views/common/inputs/BrandedMenu"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      "& .MuiPaper-root": {
         overflow: "revert",
         "& ul": {
            overflow: "hidden",
            borderRadius: "inherit",
            "& svg": {
               color: (theme) => theme.palette.primary.main + " !important",
               width: 22,
               height: 22,
            },
         },
         boxShadow: "none",
         filter: "none",
         "&::after": {
            // arrow
            content: "''",
            width: 0,
            height: 0,
            borderLeft: "0.5em solid transparent",
            borderRight: "0.5em solid transparent",
            borderTop: "0.5em solid white",
            position: "absolute",
            bottom: "-0.5em",
            left: "calc(50% - 0.5em)",
            zIndex: 0,
         },
      },
   },
})

const AnchorOrigin: MenuProps["anchorOrigin"] = {
   vertical: "top",
   horizontal: "center",
}

const TransformOrigin: MenuProps["transformOrigin"] = {
   vertical: 140,
   horizontal: "center",
}

type Props = MenuProps & {
   handleClose: () => void
}

export const ShareMenu = forwardRef<HTMLDivElement, Props>(
   ({ handleClose, ...props }, ref) => {
      const livestream = useLivestreamData()
      const agoraUid = useCurrentUID()

      const screenShareActive = livestream.mode === LivestreamModes.DESKTOP
      const PDFActive = livestream.mode === LivestreamModes.PRESENTATION
      const videoActive = livestream.mode === LivestreamModes.VIDEO

      const { trigger: setMode, isMutating: loading } = useSetLivestreamMode(
         livestream.id
      )

      const handleModeChange = (newMode: LivestreamMode) => {
         switch (newMode) {
            case LivestreamModes.DESKTOP:
               /**
                * Immediately sets the mode to screen sharing
                * TODO: Detect on client if user's agora ID matches that of livestream.screenSharerId and trigger the browser/agora screen sharing apis
                */
               setMode({
                  mode: LivestreamModes.DESKTOP,
                  screenSharerAgoraUID: agoraUid.toString(),
               })
               alert("Share screen not fully implemented yet")
               break
            case LivestreamModes.PRESENTATION:
               /**
                * TODO:
                * 1. Open PDF file picker
                * 2. Upload the PDF to storage
                * 3. **Save the storage URL  at /livestreams/{id}/presentations/presentation. Look at old implementation for reference
                * 4. Set the mode to presentation
                *
                * Maybe we want to unify all video/PDFs into one collection of different types of "content" at /livestreams/{id}/content
                */
               alert("Share PDF not implemented yet")
               break
            case LivestreamModes.VIDEO:
               /**
                * TODO:
                * 1. Open the youtube video URL dialog form
                * 2. Save the youtube video URL at /livestreams/{id}/videos/video. Look at old implementation for reference
                * 3. Set the mode to video
                *
                * Maybe we want to unify all video/PDFs into one collection of different types of "content" at /livestreams/{id}/content
                */
               alert("Share Youtube video not implemented yet")
               break
            default:
               setMode({
                  mode: LivestreamModes.DEFAULT,
               })
               break
         }

         handleClose()
      }

      return (
         <BrandedMenu
            {...props}
            anchorOrigin={AnchorOrigin}
            sx={styles.root}
            transformOrigin={TransformOrigin}
            onClose={handleClose}
            ref={ref}
         >
            <MenuItem
               disabled={loading}
               onClick={() =>
                  handleModeChange(
                     PDFActive
                        ? LivestreamModes.DEFAULT
                        : LivestreamModes.PRESENTATION
                  )
               }
            >
               <PDFIcon />
               <Typography variant="medium">
                  {PDFActive ? "Stop sharing PDF" : "Share PDF presentation"}
               </Typography>
            </MenuItem>
            <MenuItem
               disabled={loading}
               onClick={() =>
                  handleModeChange(
                     videoActive
                        ? LivestreamModes.DEFAULT
                        : LivestreamModes.VIDEO
                  )
               }
            >
               <VideoIcon />
               <Typography variant="medium">
                  {videoActive ? "Stop sharing video" : "Share video"}
               </Typography>
            </MenuItem>
            <MenuItem
               disabled={loading}
               onClick={() =>
                  handleModeChange(
                     screenShareActive
                        ? LivestreamModes.DEFAULT
                        : LivestreamModes.DESKTOP
                  )
               }
            >
               <ShareScreenIcon />
               <Typography variant="medium">
                  {screenShareActive ? "Stop sharing screen" : "Share screen"}
               </Typography>
            </MenuItem>
         </BrandedMenu>
      )
   }
)

ShareMenu.displayName = "ShareMenu"
