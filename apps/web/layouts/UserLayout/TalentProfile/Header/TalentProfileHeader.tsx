import { Button, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { universityCountriesMap } from "components/util/constants/universityCountries"
import { Fragment, useMemo, useState } from "react"
import { Settings } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { ProfileAvatar } from "./ProfileAvatar"
import { ProfileBannerIllustration } from "./ProfileBannerIllustration"
import { SettingsDialog } from "./Settings/SettingsView"

const LOGO_SIZE = 104

const styles = sxStyles({
   root: {
      borderRadius: "12px",
      backgroundColor: "white",
   },
   avatar: {
      ml: 2,
      width: `${LOGO_SIZE}px`,
      height: `${LOGO_SIZE}px`,
      fontSize: "40px",
      fontWeight: 600,
      position: "absolute",
      top: {
         xs: "261px",
         sm: "270px",
         md: "320px",
      },
      border: "2px solid white",
   },
   settingsButton: {
      alignSelf: "flex-end",
      mt: 1.5,
      mb: "8px",
      px: 2,
      color: (theme) => theme.palette.neutral[600],
      borderColor: (theme) => theme.palette.neutral[300],
      "&:hover": {
         borderColor: (theme) => theme.palette.neutral[50],
         backgroundColor: (theme) => theme.brand.black[400],
      },
      "& svg": {
         width: "14px",
         height: "14px",
      },
   },
   userDetailsRoot: {
      px: 2,
      mb: 2,
      mt: -6,
   },
   userName: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
   userFieldOfStudy: {
      fontSize: "14px",
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[700],
   },
   userLocation: {
      fontSize: "12px",
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[700],
   },
   profileImageUploadButton: {
      position: "absolute",
      ml: 11,
      mt: "6px",
   },
})

export const TalentProfileHeader = () => {
   const [openSettings, setOpenSettings] = useState(false)

   const { userData, userPresenter } = useAuth()
   const { talentProfileV1 } = useFeatureFlags()

   const fieldOfStudyDisplayName = useMemo(
      () => userPresenter?.getFieldOfStudyDisplayName(talentProfileV1),
      [userPresenter, talentProfileV1]
   )

   const userCountry = universityCountriesMap[userData.universityCountryCode]

   return (
      <Fragment>
         <Stack sx={styles.root}>
            <ProfileBannerIllustration />
            <ProfileAvatar />
            <Stack sx={styles.userDetailsRoot}>
               <Button
                  sx={styles.settingsButton}
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => {
                     setOpenSettings(true)
                  }}
               >
                  Settings
               </Button>
               <Stack>
                  <Typography variant="brandedH4" sx={styles.userName}>
                     {userPresenter?.getDisplayName()}
                  </Typography>
                  <Stack spacing={0.25}>
                     <Typography sx={styles.userFieldOfStudy}>
                        {fieldOfStudyDisplayName}
                        {userData?.university?.name
                           ? ` at ${userData?.university?.name}`
                           : null}
                     </Typography>
                     <Typography sx={styles.userLocation}>
                        {`CityTBD in Up Stack, ${userCountry}.`}
                     </Typography>
                  </Stack>
               </Stack>
            </Stack>
         </Stack>
         <SettingsDialog
            open={openSettings}
            handleClose={() => {
               setOpenSettings(false)
            }}
         />
      </Fragment>
   )
}
