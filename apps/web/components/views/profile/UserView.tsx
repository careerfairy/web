import React, { useCallback, useMemo } from "react"
import { useTheme } from "@mui/material/styles"

import makeStyles from "@mui/styles/makeStyles"

import {
   AppBar,
   Box,
   Tab,
   TabProps,
   Tabs,
   Typography,
   useMediaQuery,
} from "@mui/material"
import JoinedGroups from "./my-groups/JoinedGroups"
import AdminGroups from "./my-groups/AdminGroups"
import UserData from "./userData"
import { useFirestoreConnect } from "react-redux-firebase"
import { useSelector } from "react-redux"
import { useAuth } from "../../../HOCs/AuthProvider"
import ReferralProfileTab from "./referral/ReferralProfileTab"
import RootState from "../../../store/reducers"
import Link from "next/link"
import { useRouter } from "next/router"

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

interface LinkTabProps extends TabProps {
   href?: string
}

const LinkTab = ({ href, ...props }: LinkTabProps) => (
   // @ts-ignore
   <Link shallow as={href} href={href}>
      <a>
         <Tab {...props} />
      </a>
   </Link>
)

const useStyles = makeStyles((theme) => ({
   root: {
      backgroundColor: "rgb(250,250,250)",
      height: "100%",
      minHeight: "100vh",
      width: "100%",
   },
   bar: {
      backgroundColor: "transparent",
      boxShadow: "none",
   },
}))

interface Props {
   path: "/profile" | "/referrals" | "/my-groups" | "/admin-groups"
}

const UserView = ({ path }: Props) => {
   const { userData } = useAuth()
   const { push } = useRouter()
   const classes = useStyles()
   const theme = useTheme()
   const native = useMediaQuery(theme.breakpoints.down("sm"))
   const { authenticatedUser } = useAuth()

   const query = useMemo(() => {
      let query = []
      if (authenticatedUser?.email) {
         query.push({
            collection: "careerCenterData",
            where: userData?.isAdmin
               ? ["test", "==", false]
               : ["adminEmails", "array-contains", authenticatedUser?.email],
            storeAs: "adminGroups",
         })
      }
      return query
   }, [authenticatedUser?.email, userData?.isAdmin])

   useFirestoreConnect(query)

   const adminGroups = useSelector(
      (state: RootState) => state.firestore.ordered["adminGroups"] || []
   )

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
      <TabPanel key={2} value={path} path={"/my-groups"} dir={theme.direction}>
         <JoinedGroups userData={userData} />
      </TabPanel>,
   ]
   const tabsArray = [
      <LinkTab
         wrapped
         href="/profile"
         value="/profile"
         label={
            <Typography noWrap variant="h6">
               {native ? "Personal" : "Personal Information"}
            </Typography>
         }
      />,
      <LinkTab
         href="/referrals"
         value="/referrals"
         wrapped
         label={<Typography variant="h6">Referrals</Typography>}
      />,
      <LinkTab
         wrapped
         href="/my-groups"
         value="/my-groups"
         label={
            <Typography variant="h6">
               {native ? "Groups" : "Joined Groups"}
            </Typography>
         }
      />,
   ]

   if (adminGroups.length) {
      views.push(
         <TabPanel
            key={3}
            value={path}
            path={"/admin-groups"}
            dir={theme.direction}
         >
            <AdminGroups userData={userData} adminGroups={adminGroups} />
         </TabPanel>
      )
      tabsArray.push(
         <LinkTab
            wrapped
            href="/admin-groups"
            value="/admin-groups"
            label={
               <Typography variant="h6">
                  {native ? "Admin" : "Admin Groups"}
               </Typography>
            }
         />
      )
   }

   return (
      <>
         <AppBar className={classes.bar} position="static" color="default">
            <Tabs
               value={path}
               indicatorColor="primary"
               textColor="primary"
               selectionFollowsFocus
               sx={{ mb: 2 }}
               variant="scrollable"
               scrollButtons={false}
            >
               {tabsArray}
            </Tabs>
         </AppBar>
         {views}
      </>
   )
}

export default UserView
