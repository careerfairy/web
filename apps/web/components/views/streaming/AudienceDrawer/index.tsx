import PropTypes from "prop-types"
import React, { useEffect, useMemo } from "react"
import { useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import Drawer from "@mui/material/Drawer"
import { AppBar, Box, IconButton, Tab, Tabs } from "@mui/material"
import SwipeableViews from "react-swipeable-views"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { SwipeablePanel } from "../../../../materialUI/GlobalPanels/GlobalPanels"
import BreakdownTab from "./BreakdownTab"
import { withFirebase } from "../../../../context/firebase/FirebaseServiceContext"
import { useCurrentStream } from "../../../../context/stream/StreamContext"
import PeopleWhoJoinedTab from "./PeopleWhoJoinedTab"
import useStreamRef from "../../../custom-hook/useStreamRef"
import useCollection from "../../../custom-hook/useCollection"
import { livestreamRepo } from "../../../../data/RepositoryInstances"
import { UserLivestreamData } from "@careerfairy/shared-lib/src/livestreams"

const useStyles = makeStyles((theme) => ({
   drawerContent: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      [theme.breakpoints.down("md")]: {
         width: "100vw",
      },
      [theme.breakpoints.up("sm")]: {
         width: 400,
      },
   },
   panel: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      overflowX: "hidden",
   },
   audienceAppBar: {
      flexDirection: "row",
   },
   audienceTabs: {
      flex: 1,
   },
}))

interface ContentProps {
   isStreamer: boolean
   hideAudience: () => void
}
const DrawerContent = ({ isStreamer, hideAudience }: ContentProps) => {
   const theme = useTheme()
   const classes = useStyles()
   const streamRef = useStreamRef()
   const [value, setValue] = React.useState(isStreamer ? 1 : 0)

   const {
      currentLivestream: { id: streamId },
   } = useCurrentStream()
   const query = useMemo(
      () =>
         livestreamRepo.livestreamUsersQueryWithRef(
            streamRef,
            "participatedInLivestream"
         ),
      [streamId]
   )
   const { data: participatingStudents } = useCollection<UserLivestreamData>(
      query,
      true
   )

   const handleChange = (event, newValue) => {
      setValue(newValue)
   }

   const handleChangeIndex = (index) => {
      setValue(index)
   }

   const tabs = [<Tab key={0} label="People who joined" />]

   const panels = [
      <SwipeablePanel
         className={classes.panel}
         value={value}
         key={0}
         index={0}
         dir={theme.direction}
      >
         <PeopleWhoJoinedTab
            participatingStudents={participatingStudents}
            isStreamer={isStreamer}
         />
      </SwipeablePanel>,
   ]

   if (isStreamer) {
      tabs.push(<Tab key={1} label="Breakdown" />)
      panels.push(
         <SwipeablePanel
            className={classes.panel}
            value={value}
            key={1}
            index={1}
            dir={theme.direction}
         >
            <BreakdownTab audience={participatingStudents || []} />
         </SwipeablePanel>
      )
   }

   return (
      <React.Fragment>
         <AppBar
            className={classes.audienceAppBar}
            position="static"
            color="default"
         >
            <Box p={0.5}>
               <IconButton onClick={hideAudience} color="inherit" size="large">
                  <ArrowForwardIosIcon />
               </IconButton>
            </Box>
            <Tabs
               value={value}
               className={classes.audienceTabs}
               onChange={handleChange}
               indicatorColor="primary"
               textColor="primary"
               variant="fullWidth"
               aria-label="full width tabs example"
            >
               {tabs}
            </Tabs>
         </AppBar>
         <SwipeableViews
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={value}
            style={{ flex: 1, display: "flex" }}
            containerStyle={{ flex: 1 }}
            onChangeIndex={handleChangeIndex}
         >
            {panels}
         </SwipeableViews>
      </React.Fragment>
   )
}

interface AudienceDrawerProps {
   audienceDrawerOpen: boolean
   hideAudience: () => void
   isStreamer: boolean
}
const AudienceDrawer = ({
   audienceDrawerOpen,
   hideAudience,
   isStreamer,
}: AudienceDrawerProps) => {
   const classes = useStyles()

   return (
      <Drawer
         PaperProps={{
            className: classes.drawerContent,
         }}
         anchor="right"
         open={audienceDrawerOpen}
         onClose={hideAudience}
      >
         <DrawerContent hideAudience={hideAudience} isStreamer={isStreamer} />
      </Drawer>
   )
}

export default AudienceDrawer
