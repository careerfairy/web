import PropTypes from "prop-types";
import React from "react";
import Tab from "@material-ui/core/Tab";

function a11yProps(index) {
   return {
      id: `full-width-tab-${index}`,
      "aria-controls": `full-width-tabpanel-${index}`,
   };
}

const SimpleTab = ({ index, ...props }) => (
   <Tab {...a11yProps(index)} {...props} />
);

export default SimpleTab;

SimpleTab.propTypes = {
   index: PropTypes.number,
};
