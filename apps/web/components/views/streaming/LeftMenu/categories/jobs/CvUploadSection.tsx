import UserResume from "../../../../profile/userData/user-resume/UserResume"
import { sxStyles } from "../../../../../../types/commonTypes"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import { useCurrentStream } from "../../../../../../context/stream/StreamContext"
import { Box, Typography } from "@mui/material"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

const styles = sxStyles({
   uploadCvWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      alignItems: { xs: "start", md: "center" },
   },
   uploadCvLabel: {
      display: "flex",
      alignItems: "end",
   },
   itemLabel: {
      fontWeight: "bold",
      ml: 2,
   },
   uploadCvButton: {
      display: "flex",
      ml: { md: 6 },
      mt: { xs: 2, md: 0 },
   },
   studentsInfoWrapper: {
      display: "flex",
      alignSelf: "center",
      ml: 2,
   },
   studentsMessage: {
      variant: "body2",
      ml: 1,
      alignSelf: "center",
   },
})

type Props = {
   alreadyApplied: boolean
}
const CvUploadSection = ({ alreadyApplied }: Props) => {
   let { userData } = useAuth()
   const { isStreamer } = useCurrentStream()

   return (
      <Box sx={styles.uploadCvWrapper}>
         <Box sx={styles.uploadCvLabel}>
            <DescriptionOutlinedIcon color="secondary" fontSize="large" />
            <Box display="flex">
               <Typography variant="h6" sx={styles.itemLabel}>
                  Upload CV
               </Typography>
            </Box>
         </Box>

         {Boolean(userData) ? (
            <Box sx={styles.uploadCvButton}>
               <Box>
                  <UserResume
                     userData={userData}
                     showOnlyButton={true}
                     disabled={isStreamer || alreadyApplied}
                  />
               </Box>
               {Boolean(isStreamer) ? (
                  <Box sx={styles.studentsInfoWrapper}>
                     <InfoOutlinedIcon />
                     <Typography sx={styles.studentsMessage}>
                        Only for students
                     </Typography>
                  </Box>
               ) : null}
            </Box>
         ) : null}
      </Box>
   )
}

export default CvUploadSection
