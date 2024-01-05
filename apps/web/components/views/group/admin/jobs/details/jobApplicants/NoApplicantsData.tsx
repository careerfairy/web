import { Box, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { AlertOctagon } from "react-feather"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      mt: { md: "100px" },
      px: { md: 4 },
   },
   content: {
      maxWidth: "610px",
      alignItems: "center",
      textAlign: "center",
      background: "white",
      borderRadius: "16px",
      py: 4,
      px: { xs: 1, md: 4 },
   },
   title: {
      fontSize: "20px",
      fontWeight: "600",
   },
   message: {
      fontSize: "16px",
      fontWeight: "400",
   },
})
const NoApplicantsData = () => {
   return (
      <Box sx={styles.wrapper}>
         <Stack spacing={2} sx={styles.content}>
            <AlertOctagon size={68} color={"#6749EA"} />

            <Typography sx={styles.title}>
               Unable to display applicants&apos; data
            </Typography>

            <Typography sx={styles.message}>
               Your company&apos;s privacy policy is necessary to display
               applicant data for new job openings. It wasn&apos;t added to your
               company profile when this job opening was created. As a result,
               you won&apos;t be able to access applicants&apos; data for this
               particular job opening.
            </Typography>
         </Stack>
      </Box>
   )
}

export default NoApplicantsData
