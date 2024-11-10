import { Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useUserStudyBackgroundsSWR } from "components/custom-hook/user/useUserStudyBackgroundsSWR"
import { sxStyles } from "types/commonTypes"
import { ProfileStudyBackground } from "./ProfileStudyBackground"

const styles = sxStyles({
   wrapper: {
      my: "20px",
      px: 2,
   },
})
export const ProfileDetails = () => {
   return (
      <SuspenseWithBoundary>
         <ProfileDetailsView />
      </SuspenseWithBoundary>
   )
}

export const ProfileDetailsView = () => {
   const { data: studyBackgrounds } = useUserStudyBackgroundsSWR()

   return (
      <Stack sx={styles.wrapper}>
         <ProfileStudyBackground studyBackgrounds={studyBackgrounds} />
      </Stack>
   )
}
