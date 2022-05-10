import React, { useCallback } from "react"
import { useTheme } from "@mui/material/styles"

import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import Groups from "../../components/views/profile/my-groups/Groups"
import UserData from "../../components/views/profile/userData"
import { useAuth } from "../../HOCs/AuthProvider"
import ReferralProfileTab from "../../components/views/profile/referral/ReferralProfileTab"
import { useRouter } from "next/router"
import { StylesProps } from "../../types/commonTypes"
import Link from "../../components/views/common/Link"
import { Container } from "@mui/material"

function TabPanel(props) {
   const { children, value, path, ...other } = props
   return (
      <div
         role="tabpanel"
         hidden={value !== path}
         id={`full-width-tabpanel-${path}`}
         aria-labelledby={`full-width-tab-${path}`}
         {...other}
      >
         {value === path && <Box sx={{ pb: 3 }}>{children}</Box>}
      </div>
   )
}

const styles: StylesProps = {
   bar: {
      backgroundColor: "transparent",
      boxShadow: "none",
      mb: 2,
   },
}

interface Props {
   path: "/profile" | "/referrals" | "/groups"
}

const UserView = ({ path }: Props) => {
   const { userData } = useAuth()
   const { push } = useRouter()
   const theme = useTheme()
   const native = useMediaQuery(theme.breakpoints.down("sm"))

   const redirectToReferralsTab = useCallback(() => {
      return push("/referrals", undefined, {
         shallow: true,
      })
   }, [])

   const views = [
      <TabPanel key={0} value={path} path={"/profile"} dir={theme.direction}>
         <UserData
            userData={userData}
            redirectToReferralsTab={redirectToReferralsTab}
         />
      </TabPanel>,
      <TabPanel key={1} value={path} path={"/referrals"} dir={theme.direction}>
         <ReferralProfileTab userData={userData} />
      </TabPanel>,
      <TabPanel key={2} value={path} path={"/groups"} dir={theme.direction}>
         <Groups />
      </TabPanel>,
   ]
   const tabsArray = [
      <Tab
         component={Link}
         wrapped
         key={0}
         shallow
         href="/profile"
         value="/profile"
         label={
            <Typography variant="h6">
               {native ? "Personal" : "Personal Information"}
            </Typography>
         }
      />,
      <Tab
         component={Link}
         key={1}
         href="/referrals"
         value="/referrals"
         wrapped
         shallow
         label={<Typography variant="h6">Referrals</Typography>}
      />,
      <Tab
         component={Link}
         wrapped
         key={2}
         shallow
         href="/groups"
         value="/groups"
         label={<Typography variant="h6">Groups</Typography>}
      />,
   ]

   return (
      <Container disableGutters maxWidth={"lg"}>
         <AppBar sx={styles.bar} position="static" color="default">
            <Tabs
               value={path}
               variant={"scrollable"}
               indicatorColor="primary"
               textColor="primary"
               selectionFollowsFocus
               allowScrollButtonsMobile
            >
               {tabsArray}
            </Tabs>
         </AppBar>
         {views}
      </Container>
   )
}

export default UserView
