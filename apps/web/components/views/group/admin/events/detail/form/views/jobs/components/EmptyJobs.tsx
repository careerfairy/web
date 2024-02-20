import { Box, Stack, Typography, useTheme } from "@mui/material"
import { Briefcase } from "react-feather"
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

const EmptyJobs = () => {
   const theme = useTheme()

   return (
      <Box sx={styles.wrap}>
         <Stack spacing={2} sx={styles.content}>
            <Briefcase size={70} color={theme.palette.secondary.main} />

            <Typography variant="brandedH4" fontWeight={"bold"}>
               No jobs linked to your live stream
            </Typography>

            <Typography variant={"brandedBody"}>
               Supercharge your recruitment efforts. Link a job opening and
               engage with the next generation of talent effortlessly.
            </Typography>
         </Stack>
      </Box>
   )
}

export default EmptyJobs
