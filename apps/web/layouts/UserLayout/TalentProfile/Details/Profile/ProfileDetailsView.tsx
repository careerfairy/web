import { Stack } from "@mui/material"
import { useUserLanguages } from "components/custom-hook/user/useUserLanguages"
import { useUserLinks } from "components/custom-hook/user/useUserLinks"
import { useUserStudyBackgrounds } from "components/custom-hook/user/useUserStudyBackgrounds"
import { sxStyles } from "types/commonTypes"
import { ProfileLanguages } from "./ProfileLanguages"
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
   const { hasItems: userHasLanguages } = useUserLanguages()

   return (
      <Stack sx={styles.wrapper} spacing={3}>
         <ProfileStudyBackground showAddIcon={userHasStudyBackgrounds} />
         <ProfileLinks showAddIcon={userHasLinks} />
         <ProfileLanguages showAddIcon={userHasLanguages} />
      </Stack>
   )
}
