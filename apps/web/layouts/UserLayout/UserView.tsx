import { useTheme } from "@mui/material/styles"

import { Container } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import Link from "../../components/views/common/Link"
import CareerSkills from "../../components/views/profile/career-skills/CareerSkills"
import ProfileCustomJobs from "../../components/views/profile/custom-jobs/ProfileCustomJobs"
import Groups from "../../components/views/profile/my-groups/Groups"
import ReferralProfileTab from "../../components/views/profile/referral/ReferralProfileTab"
import MyRecruitersTab from "../../components/views/profile/saved-recruiters/MyRecruitersTab"
import UserData from "../../components/views/profile/userData"
import { StylesProps } from "../../types/commonTypes"

type TabPanelProps = {
   children: () => JSX.Element
   value: string
   path: string
   // All other props
   [x: string]: any
}

function TabPanel(props: TabPanelProps) {
   const { children, value, path, ...other } = props
   return (
      <div
         role="tabpanel"
         hidden={value !== path}
         id={`full-width-tabpanel-${path}`}
         aria-labelledby={`full-width-tab-${path}`}
         {...other}
      >
         {value === path && <Box sx={{ pb: 3 }}>{children()}</Box>}
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

const pages = {
   "/profile": {
      title: {
         compact: "Personal",
         full: "Personal Information",
      },
      component: UserData,
   },
   "/profile/my-jobs": {
      title: {
         compact: "Jobs",
         full: "My Jobs",
      },
      component: ProfileCustomJobs,
   },
   "/profile/career-skills": {
      title: {
         compact: "Career Skills",
         full: "My Career Skills",
      },
      component: CareerSkills,
   },
   "/profile/referrals": {
      title: {
         compact: "Referrals",
         full: "Referrals",
      },
      component: ReferralProfileTab,
   },
   "/profile/saved-recruiters": {
      title: {
         compact: "Recruiters",
         full: "My Recruiters",
      },
      component: MyRecruitersTab,
   },
   "/profile/groups": {
      title: {
         compact: "Groups",
         full: "Groups",
      },
      component: () => <Groups />,
   },
}

type Props = {
   currentPath: keyof typeof pages
}

const UserView = ({ currentPath }: Props) => {
   const theme = useTheme()
   const native = useMediaQuery(theme.breakpoints.down("sm"))

   const views = Object.entries(pages).map(([key, value], index) => (
      <TabPanel
         key={index}
         value={currentPath}
         path={key}
         dir={theme.direction}
      >
         {value.component}
      </TabPanel>
   ))

   const tabsArray = Object.entries(pages).map(([key, value], index) => (
      <Tab
         component={Link}
         wrapped
         key={`tab-${index}`}
         shallow
         href={key}
         value={key}
         label={
            <Typography variant="h6">
               {native ? value.title.compact : value.title.full}
            </Typography>
         }
      />
   ))

   return (
      <Container disableGutters maxWidth={"lg"}>
         <AppBar sx={styles.bar} position="static" color="default">
            <Tabs
               value={currentPath}
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
