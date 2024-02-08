import { sxStyles } from "types/commonTypes"
import React from "react"
import { useStreamingContext } from "../context"
import { Button, ButtonGroup } from "@mui/material"
import Link from "components/views/common/Link"
import { appendCurrentQueryParams } from "components/util/url"

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
   const { isHost, livestreamId } = useStreamingContext()
   return (
      <ButtonGroup
         size="small"
         disableElevation
         sx={styles.root}
         variant="contained"
      >
         <Button
            component={Link}
            href={appendCurrentQueryParams(
               isHost
                  ? `/streaming/viewer/${livestreamId}`
                  : `/streaming/host/${livestreamId}`
            )}
         >
            {isHost ? "Currently host" : "Currently viewer"}
         </Button>
      </ButtonGroup>
   )
}
