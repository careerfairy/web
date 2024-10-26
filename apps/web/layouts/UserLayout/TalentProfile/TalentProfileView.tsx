import { Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { TalentProfileHeader } from "./Header/TalentProfileHeader"
import { TalentProfileDetails } from "./TalentProfileDetails"

const styles = sxStyles({
   wrapper: {
      mx: 2,
      mb: 1,
   },
})

export const TalentProfileView = () => {
   return (
      <Stack spacing={2} sx={styles.wrapper}>
         <TalentProfileHeader />
         <TalentProfileDetails />
      </Stack>
   )
}
