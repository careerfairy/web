import React from "react"
import { Box } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import LivestreamSearch from "./LivestreamSearch"
import Stack from "@mui/material/Stack"
import UserTypeTabs from "./UserTypeTabs"
import ExportPdfButton from "./ExportPDFButton"

const spacing = 1

const styles = sxStyles({
   wrapper: {
      flex: 1,
      p: spacing,
   },
   searchWrapper: {
      flex: 1,
      width: "100%",
   },
})
const LivestreamSearchNav = () => {
   return (
      <Stack
         sx={styles.wrapper}
         spacing={3}
         direction={{ xs: "column", sm: "row" }}
         alignItems={{ xs: "stretch", sm: "center" }}
      >
         <Box sx={styles.searchWrapper} flex={1}>
            <LivestreamSearch />
         </Box>
         <Stack minHeight={53} height="100%" direction="row" spacing={2}>
            <UserTypeTabs />
            <ExportPdfButton />
         </Stack>
      </Stack>
   )
}

export default LivestreamSearchNav
