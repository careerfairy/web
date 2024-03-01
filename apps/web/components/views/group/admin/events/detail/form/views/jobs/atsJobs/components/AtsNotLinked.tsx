import { Box, Stack, Typography, useTheme } from "@mui/material"
import React from "react"
import { AlertCircle as AlertIcon } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   wrap: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      background: "#F7F8FC",
      borderRadius: (theme) => theme.spacing(1),
      border: "1px solid #EDE7FD",
      py: "32px",
   },
   content: {
      alignItems: "center",
      textAlign: "center",
      maxWidth: "500px",
      mx: 2,
   },
})

const AtsNotLinked = () => {
   const theme = useTheme()

   return (
      <Box sx={styles.wrap}>
         <Stack spacing={3} sx={styles.content}>
            <AlertIcon size={70} color={theme.palette.secondary.main} />

            <Typography variant="brandedH4" fontWeight={"bold"}>
               No ATS system linked yet!
            </Typography>

            <Typography variant={"brandedBody"}>
               Before you can associate jobs to your live stream you need to
               link your ATS system with CareerFairy.
            </Typography>

            <Typography variant={"brandedBody"}>
               You can do that in the ATS section of your CareerFairy dashboard.
            </Typography>
         </Stack>
      </Box>
   )
}

export default AtsNotLinked
