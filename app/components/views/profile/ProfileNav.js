import React, { useMemo, useState } from "react"
import SwipeableViews from "react-swipeable-views"
import { useTheme } from "@mui/material/styles"

import makeStyles from "@mui/styles/makeStyles"

import {
   Container,
   Typography,
   useMediaQuery,
   AppBar,
   Tabs,
   Tab,
   Box,
} from "@mui/material"
import { withFirebase } from "context/firebase/FirebaseServiceContext"
import JoinedGroups from "./my-groups/JoinedGroups"
import AdminGroups from "./my-groups/AdminGroups"
import UserData from "./userData"
import { useFirestoreConnect } from "react-redux-firebase"
import { useSelector } from "react-redux"
import { useAuth } from "../../../HOCs/AuthProvider"
import ReferralProfileTab from "./referral/ReferralProfileTab"

function TabPanel(props) {
   const { children, value, index, ...other } = props
   return (
      <div
         role="tabpanel"
         hidden={value !== index}
         id={`full-width-tabpanel-${index}`}
         aria-labelledby={`full-width-tab-${index}`}
         {...other}
      >
         {value === index && <Box py={3}>{children}</Box>}
      </div>
   )
}

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

const ProfileNav = ({ userData }) => {
   const classes = useStyles()
   const theme = useTheme()
   const native = useMediaQuery(theme.breakpoints.down("sm"))
   const [value, setValue] = useState(0)
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
      (state) => state.firestore.ordered["adminGroups"] || []
   )

   const handleChange = (event, newValue) => {
      setValue(newValue)
   }

   const handleChangeIndex = (index) => {
      setValue(index)
   }

   const views = [
      <TabPanel key={0} value={value} index={0} dir={theme.direction}>
         <UserData userData={userData} />
      </TabPanel>,
      <TabPanel key={1} value={value} index={1} dir={theme.direction}>
         <JoinedGroups userData={userData} />
      </TabPanel>,
      <TabPanel key={2} value={value} index={2} dir={theme.direction}>
         <ReferralProfileTab userData={userData} />
      </TabPanel>,
   ]
   const tabsArray = [
      <Tab
         key={0}
         wrapped
         fullWidth
         label={
            <Typography noWrap variant="h5">
               {native ? "Personal" : "Personal Information"}
            </Typography>
         }
      />,
      <Tab
         key={1}
         wrapped
         fullWidth
         label={
            <Typography variant="h5">
               {native ? "Groups" : "Joined Groups"}
            </Typography>
         }
      />,
      <Tab
         key={2}
         wrapped
         fullWidth
         label={<Typography variant="h5">Referrals</Typography>}
      />,
   ]

   if (adminGroups.length) {
      views.push(
         <TabPanel key={3} value={value} index={3} dir={theme.direction}>
            <AdminGroups userData={userData} adminGroups={adminGroups} />
         </TabPanel>
      )
      tabsArray.push(
         <Tab
            key={2}
            wrapped
            fullWidth
            label={
               <Typography variant="h5">
                  {native ? "Admin" : "Admin Groups"}
               </Typography>
            }
         />
      )
   }

   return (
      <Container disableGutters sx={{ mt: "50px", mb: "auto" }}>
         <AppBar className={classes.bar} position="static" color="default">
            <Tabs
               value={value}
               onChange={handleChange}
               indicatorColor="primary"
               textColor="primary"
               selectionFollowsFocus
               centered
            >
               {tabsArray}
            </Tabs>
         </AppBar>
         <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            onChangeIndex={handleChangeIndex}
         >
            {views}
         </SwipeableViews>
      </Container>
   )
}

export default ProfileNav
