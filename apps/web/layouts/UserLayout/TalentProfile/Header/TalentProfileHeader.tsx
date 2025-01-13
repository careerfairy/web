import { Button, Skeleton, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCountryCityData from "components/custom-hook/countries/useCountryCityData"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { useRouter } from "next/router"
import { Fragment, useMemo, useState } from "react"
import { Settings } from "react-feather"
import { useSelector } from "react-redux"
import { getProfileTab } from "store/selectors/profileSettingsSelectors"
import { sxStyles } from "types/commonTypes"
import { TAB_VALUES } from "../TalentProfileView"
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
   const router = useRouter()

   const isSettingsPage = router.pathname.includes(TAB_VALUES.settings.value)
   const [openSettings, setOpenSettings] = useState(isSettingsPage)
   console.log("🚀 ~ TalentProfileHeader ~ openSettings:", openSettings)

   const profileTab = useSelector(getProfileTab)

   const { userData, userPresenter } = useAuth()
   const { talentProfileV1 } = useFeatureFlags()

   const fieldOfStudyDisplayName = useMemo(
      () => userPresenter?.getFieldOfStudyDisplayName(talentProfileV1),
      [userPresenter, talentProfileV1]
   )

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
                     router.push(
                        {
                           pathname: TAB_VALUES.settings.value,
                           query: router.query,
                        },
                        undefined,
                        { shallow: true }
                     )
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
                     <SuspenseWithBoundary
                        fallback={
                           <Skeleton
                              sx={{ maxWidth: "300px", height: "100%" }}
                           />
                        }
                     >
                        <UserLocation />
                     </SuspenseWithBoundary>
                  </Stack>
               </Stack>
            </Stack>
         </Stack>
         <ConditionalWrapper condition={isSettingsPage}>
            <SettingsDialog
               open={openSettings}
               handleClose={() => {
                  setOpenSettings(false)

                  delete router.query["tab"]

                  router.push(
                     {
                        pathname: profileTab,
                        query: router.query,
                     }
                     // undefined,
                     // { shallow: true }
                  )
               }}
            />
         </ConditionalWrapper>
      </Fragment>
   )
}

const UserLocation = () => {
   const { userData } = useAuth()
   const { data } = useCountryCityData(
      userData?.countryIsoCode,
      userData?.cityIsoCode
   )

   if (!data?.city && !data?.country) return null

   return (
      <Typography sx={styles.userLocation}>
         {data?.city?.name
            ? `${data.city.name}, ${data?.country?.name}`
            : data?.country?.name}
      </Typography>
   )
}
