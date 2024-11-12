import { Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"
import { TalentProfileHeader } from "./Header/TalentProfileHeader"
import { TalentProfileDetails } from "./TalentProfileDetails"

const styles = sxStyles({
   wrapper: {
      mx: {
         sm: 0,
         md: 2,
      },
      mb: 1,
   },
})

export const TalentProfileView = () => {
   const isMobile = useIsMobile()

   return (
      <Stack spacing={isMobile ? 0 : 2} sx={styles.wrapper}>
         <TalentProfileHeader />
         <TalentProfileDetails />
      </Stack>
   )
}
