import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Grid, Tab, Tabs } from "@mui/material";
import VideoTab from "./VideoTab";
import AudioTab from "./AudioTab";

const useStyles = makeStyles((theme) => ({
   grid: {
      flexGrow: 1,
   },
   tab: {
      minWidth: "0 !important",
   },
}));

function TabPanel(props) {
   const { children, value, index, ...other } = props;

   return (
      <div
         role="tabpanel"
         hidden={value !== index}
         id={`vertical-tabpanel-${index}`}
         aria-labelledby={`vertical-tab-${index}`}
         {...other}
      >
         {value === index && <div>{children}</div>}
      </div>
   );
}

function a11yProps(index) {
   return {
      id: `vertical-tab-${index}`,
      "aria-controls": `vertical-tabpanel-${index}`,
   };
}

const DeviceSelectMenu = ({
   devices,
   displayableMediaStream,
   localStream,
   openModal,
   localMediaHandlers,
   mediaControls,
}) => {
   const classes = useStyles();

   const [value, setValue] = React.useState(0);

   const handleChange = (event, newValue) => {
      setValue(newValue);
   };

   return (
      <div className={classes.grid}>
         <Grid
            justifyContent="center"
            alignItems="center"
            container
            spacing={3}
         >
            <Grid xs={3} item>
               <Tabs
                  orientation="vertical"
                  variant="scrollable"
                  value={value}
                  onChange={handleChange}
                  aria-label="Vertical tabs example"
               >
                  <Tab
                     label="Video"
                     className={classes.tab}
                     {...a11yProps(0)}
                  />
                  <Tab
                     label="Audio"
                     className={classes.tab}
                     {...a11yProps(1)}
                  />
               </Tabs>
            </Grid>
            <Grid xs={9} item>
               <TabPanel value={value} index={0}>
                  <VideoTab
                     devices={devices}
                     openModal={openModal}
                     localStream={localStream}
                     mediaControls={mediaControls}
                     localMediaHandlers={localMediaHandlers}
                     displayableMediaStream={displayableMediaStream}
                  />
               </TabPanel>
               <TabPanel value={value} index={1}>
                  <AudioTab
                     devices={devices}
                     openModal={openModal}
                     localStream={localStream}
                     mediaControls={mediaControls}
                     localMediaHandlers={localMediaHandlers}
                     displayableMediaStream={displayableMediaStream}
                  />
               </TabPanel>
            </Grid>
         </Grid>
      </div>
   );
};

export default DeviceSelectMenu;
