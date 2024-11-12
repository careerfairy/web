import { Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { ProfileStudyBackground } from "./ProfileStudyBackground"

const styles = sxStyles({
   wrapper: {
      mt: "20px",
      px: 2,
   },
})

export const ProfileDetailsView = () => {
   return (
      <Stack sx={styles.wrapper}>
         <ProfileStudyBackground />
      </Stack>
   )
}
