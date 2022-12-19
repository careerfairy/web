import React from "react"
import { Box } from "@mui/material"
import EndOfStreamView from "../components/views/viewer/EndOfStreamView"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

const stream: LivestreamEvent = {
   start: new Date(),
   id: "1",
   title: "Test",
}
const TestPage = () => {
   return (
      <Box
         sx={{
            width: "100%",
            minHeight: "100vh",
            border: "1px solid red",
         }}
      >
         <EndOfStreamView {...stream} />
      </Box>
   )
}

export default TestPage
