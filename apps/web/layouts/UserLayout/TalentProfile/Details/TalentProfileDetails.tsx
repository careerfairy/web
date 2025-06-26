import { Box, Tab, Tabs } from "@mui/material"
import { useRouter } from "next/router"
import { useDispatch } from "react-redux"
import { useEffectOnce } from "react-use"
import { setProfileTab } from "store/reducers/profileSettingsReducer"
import { sxStyles } from "types/commonTypes"
import { TalentProfileTabValues } from "../TalentProfileView"
import { TAB_VALUES } from "../constants"
import { ProfileFollowingCompaniesDetailsView } from "./FollowingCompanies/ProfileFollowingCompaniesDetailsView"
import { ProfileJobsDetailsView } from "./Jobs/ProfileJobsDetailsView"
import { ProfileDetailsView } from "./Profile/ProfileDetailsView"

const styles = sxStyles({
   root: {
      backgroundColor: "white",
      borderRadius: "12px 12px 12px 12px",
      minHeight: "400px",
   },
   tabs: {
      "& *": {
         textTransform: "none !important",
         fontWeight: "400 !important",
         fontSize: "16px !important",
      },
      "& .MuiTab-root.Mui-selected": {
         fontWeight: "600 !important",
         color: (theme) => theme.palette.primary.main,
      },
      "& .MuiTabs-indicator": {
         backgroundColor: (theme) => theme.palette.primary.main,
      },
      borderBottom: "1px solid #EAEAEA",
   },
   tab: {
      width: "125px",
   },
})

type Props = {
   currentPath: TalentProfileTabValues
}

export const TalentProfileDetails = ({ currentPath }: Props) => {
   const dispatch = useDispatch()

   const router = useRouter()

   const handleTabChange = (_, newValue) => {
      dispatch(setProfileTab(newValue))

      router.push(
         {
            pathname: newValue,
            query: {
               ...router.query,
            },
         },
         undefined,
         { shallow: true, scroll: false }
      )
   }

   useEffectOnce(() => {
      if (currentPath !== "/profile/settings") {
         dispatch(setProfileTab(currentPath))
      }
   })

   return (
      <Box sx={styles.root}>
         <Tabs
            value={currentPath}
            onChange={handleTabChange}
            aria-label="Talent profile tabs"
            sx={styles.tabs}
         >
            <Tab
               label={TAB_VALUES.profile.label}
               value={TAB_VALUES.profile.value}
               sx={styles.tab}
            />
            <Tab
               label={TAB_VALUES.jobs.label}
               value={TAB_VALUES.jobs.value}
               sx={styles.tab}
            />
            <Tab
               label={TAB_VALUES.company.label}
               value={TAB_VALUES.company.value}
               sx={styles.tab}
            />
         </Tabs>
         <Box>
            {currentPath === TAB_VALUES.profile.value ? (
               <ProfileDetailsView />
            ) : null}
            {currentPath === TAB_VALUES.jobs.value ? (
               <ProfileJobsDetailsView />
            ) : null}
            {currentPath === TAB_VALUES.company.value ? (
               <ProfileFollowingCompaniesDetailsView />
            ) : null}
         </Box>
      </Box>
   )
}
