import { sxStyles } from "@careerfairy/shared-ui"
import React from "react"
import { useStreamContext } from "../context"
import { Button } from "@mui/material"
import { Link } from "components"

const styles = sxStyles({
   root: {
      position: "fixed",
      bottom: 10,
      right: 10,
      opacity: 0.8,
   },
})

export const ToggleStreamModeButton = () => {
   const { isHost } = useStreamContext()
   return (
      <Button
         sx={styles.root}
         variant="contained"
         component={Link}
         href={isHost ? "/123" : "/123/host"}
      >
         {isHost ? "Switch to Viewer Mode" : "Switch to Host Mode"}
      </Button>
   )
}
