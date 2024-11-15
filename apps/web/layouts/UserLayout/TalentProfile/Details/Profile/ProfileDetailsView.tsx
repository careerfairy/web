import { Stack } from "@mui/material"
import { useUserLinks } from "components/custom-hook/user/useUserLinks"
import { useUserStudyBackgrounds } from "components/custom-hook/user/useUserStudyBackgrounds"
import { sxStyles } from "types/commonTypes"
import { ProfileLinks } from "./ProfileLinks"
import { ProfileStudyBackground } from "./ProfileStudyBackground"

const styles = sxStyles({
   wrapper: {
      my: "20px",
      px: 2,
   },
})
export const ProfileDetailsView = () => {
   const { hasItems: userHasStudyBackgrounds } = useUserStudyBackgrounds()
   const { hasItems: userHasLinks } = useUserLinks()

   return (
      <Stack sx={styles.wrapper} spacing={3}>
         <ProfileStudyBackground hasItems={userHasStudyBackgrounds} />
         <ProfileLinks hasItems={userHasLinks} />
      </Stack>
   )
}
