import { useTheme } from "@mui/material/styles"
import { Box, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import { Briefcase } from "react-feather"
import { sxStyles } from "../../../../../types/commonTypes"
import CreateJobButton from "../components/CreateJobButton"

const styles = sxStyles({
   wrap: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      mb: "100px",
      px: 4,
   },
   info: {
      maxWidth: "500px",
      alignItems: "center",
      textAlign: "center",
   },
   subtitle: {
      fontSize: "16px",
   },
   btn: {
      textTransform: "none",
   },
})

const EmptyJobsView = () => {
   const theme = useTheme()

   return (
      <Box sx={styles.wrap}>
         <Stack spacing={4} sx={styles.info}>
            <Briefcase size={70} color={theme.palette.secondary.main} />

            <Typography variant={"h5"} fontWeight={"bold"}>
               Promote your job openings!
            </Typography>
            <Typography variant={"subtitle1"} sx={styles.subtitle}>
               Ready to kickstart your hiring journey? Create your first job
               posting and promote it to your talent community.
            </Typography>
            <CreateJobButton />
         </Stack>
      </Box>
   )
}

export default EmptyJobsView
