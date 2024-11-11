import { Stack } from "@mui/material"
import { useUserStudyBackgrounds } from "components/custom-hook/user/useUserStudyBackgrounds"
import { sxStyles } from "types/commonTypes"
import { ProfileStudyBackground } from "./ProfileStudyBackground"

const styles = sxStyles({
   wrapper: {
      my: "20px",
      px: 2,
   },
})
export const ProfileDetailsView = () => {
   const { hasItems } = useUserStudyBackgrounds()

   return (
      <Stack sx={styles.wrapper}>
         <ProfileStudyBackground hasItems={hasItems} />
      </Stack>
   )
}
