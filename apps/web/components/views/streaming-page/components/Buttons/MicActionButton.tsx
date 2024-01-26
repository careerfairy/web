import { forwardRef } from "react"
import { Mic, MicOff } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLocalTracks } from "../../context"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"
import { useMicrophones } from "components/custom-hook/streaming"
import { Tooltip } from "@mui/material"

const styles = sxStyles({
   off: {
      "& svg": {
         color: "error.main",
      },
   },
})

export const MicActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
   (props, ref) => {
      const {
         toggleMicrophone,
         micOn: microphoneOn,
         localMicrophoneTrack: { isLoading },
      } = useLocalTracks()

      const { error } = useMicrophones()

      const micPermDenied = error?.code === "PERMISSION_DENIED"

      return (
         <Tooltip
            placement="top"
            title={
               micPermDenied
                  ? "Microphone permission denied. Please enable it in your browser settings."
                  : ""
            }
         >
            <span>
               <ActionBarButtonStyled
                  color={!microphoneOn ? "error" : undefined}
                  ref={ref}
                  onClick={toggleMicrophone}
                  sx={!microphoneOn ? styles.off : undefined}
                  disabled={micPermDenied || isLoading}
                  {...props}
               >
                  {microphoneOn ? <Mic /> : <MicOff />}
               </ActionBarButtonStyled>
            </span>
         </Tooltip>
      )
   }
)

MicActionButton.displayName = "MicActionButton"
