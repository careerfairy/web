import { Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"
import { TalentProfileDetails } from "./Details/TalentProfileDetails"
import { TalentProfileHeader } from "./Header/TalentProfileHeader"

const styles = sxStyles({
   wrapper: {
      mx: {
         sm: 0,
         md: 2,
      },
      mb: 1,
   },
})

export const TAB_VALUES = {
   profile: {
      value: "/profile",
      label: "Profile",
   },
   jobs: {
      value: "/profile/jobs",
      label: "Jobs",
   },
   company: {
      value: "/profile/companies",
      label: "Companies",
   },
} as const

export type TabValue = (typeof TAB_VALUES)[keyof typeof TAB_VALUES]["value"]

type Props = {
   currentPath: TabValue
}

export const TalentProfileView = ({ currentPath }: Props) => {
   const isMobile = useIsMobile()

   return (
      <Stack spacing={isMobile ? 0 : 2} sx={styles.wrapper}>
         <TalentProfileHeader />
         <TalentProfileDetails currentPath={currentPath} />
      </Stack>
   )
}
