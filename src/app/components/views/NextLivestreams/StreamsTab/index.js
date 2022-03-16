import PropTypes from "prop-types";
import React from "react";
import { AppBar, Tabs } from "@mui/material";
import SimpleTab from "../../../../materialUI/GlobalTabs/SimpleTab";

const styles = {
   indicator: {
      height: (theme) => theme.spacing(0.7),
      borderRadius: (theme) => theme.spacing(1, 1, 0.3, 0.3),
   },
   root: {
      boxShadow: "none",
   },
   tab: {
      fontWeight: (theme) => theme.typography.fontWeightBold,
   },
};

const StreamsTab = ({ handleChange, value, tabsColor }) => {
   return (
      <AppBar sx={styles.root} position="static" color="transparent">
         <Tabs
            value={value}
            onChange={handleChange}
            textColor="inherit"
            TabIndicatorProps={{
               sx: {
                  ...styles.indicator,
               },
            }}
            variant="fullWidth"
            aria-label="full width tabs example"
         >
            <SimpleTab
               sx={{
                  ...styles.tab,
               }}
               label="Upcoming Events"
               value="upcomingEvents"
               index={0}
            />
            <SimpleTab
               sx={{
                  ...styles.tab,
               }}
               label="Past Events"
               value="pastEvents"
               index={1}
            />
         </Tabs>
      </AppBar>
   );
};

StreamsTab.propTypes = {
   handleChange: PropTypes.func.isRequired,
   value: PropTypes.any.isRequired,
};

export default StreamsTab;
