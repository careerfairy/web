import { sxStyles } from "@careerfairy/shared-ui"
import React from "react"
import { useStreamContext } from "../context"
import { Button, ButtonGroup } from "@mui/material"
import { Link } from "components"

const styles = sxStyles({
   root: {
      position: "fixed",
      bottom: 10,
      right: 10,
      opacity: 0.8,
      borderRadius: 66,
   },
})

export const ToggleStreamModeButton = () => {
   const { isHost, toggleIsStreaming, isStreaming } = useStreamContext()
   return (
      <ButtonGroup
         size="small"
         disableElevation
         sx={styles.root}
         variant="contained"
      >
         {isHost ? null : (
            <Button onClick={toggleIsStreaming}>
               {isStreaming ? "Stop streaming" : "Start streaming"}
            </Button>
         )}
         <Button component={Link} href={isHost ? "/123" : "/123/host"}>
            {isHost ? "Currently host" : "currently viewer"}
         </Button>
      </ButtonGroup>
   )
}
