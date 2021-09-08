import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Tab, Tabs } from "@material-ui/core";
import SimpleTab from "../../../../materialUI/GlobalTabs/SimpleTab";

const useStyles = makeStyles((theme) => ({
  indicator: {
    backgroundColor: ({ tabsColor }) => tabsColor || theme.palette.common.white,
    height: theme.spacing(0.7),
    borderRadius: theme.spacing(1, 1, 0.3, 0.3),
  },
  root: {
    boxShadow: "none",
  },
  tab: {
    color: ({ tabsColor }) => tabsColor || theme.palette.common.white,
    fontWeight: theme.typography.fontWeightBold,
  },
}));

const StreamsTab = ({ handleChange, value, tabsColor }) => {
  const classes = useStyles({ tabsColor });

  return (
    <AppBar
      classes={{ root: classes.root }}
      position="static"
      color="transparent"
    >
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="inherit"
        classes={{ indicator: classes.indicator }}
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <SimpleTab
          classes={{ root: classes.tab }}
          label="Upcoming Events"
          value="upcomingEvents"
          index={0}
        />
        <SimpleTab
          classes={{ root: classes.tab }}
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
