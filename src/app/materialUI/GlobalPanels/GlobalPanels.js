import React from "react";
import * as PropTypes from "prop-types";
import { Box } from "@material-ui/core";

export const TabPanel = ({
   hidden,
   children,
   height,
   value,
   index,
   className,
   ...other
}) => {
   return (
      <Box
         hidden={hidden}
         className={className}
         {...other}
         style={{ height: height || "100%", ...other.style }}
      >
         {children}
      </Box>
   );
};

// function a11yProps(index) {
//    return {
//       id: `simple-tab-${index}`,
//       "aria-controls": `simple-tabpanel-${index}`,
//    };
// }
//
// export const Tab = ({ index, ...props }) => {
//    return <Tab {...a11yProps(index)} {...props} />;
// };
//
// Tab.propTypes = {
//    index: PropTypes.number.isRequired,
// };

export const SimplePanel = ({ panelId, children, height, ...other }) => {
   return (
      <div {...other} id={panelId} style={{ height: "100%", ...other.style }}>
         {children}
      </div>
   );
};

export const SwipeablePanel = (props) => {
   const { children, value, index, ...other } = props;

   return (
      <div
         role="tabpanel"
         hidden={value !== index}
         id={`full-width-tabpanel-${index}`}
         aria-labelledby={`full-width-tab-${index}`}
         {...other}
      >
         {value === index && <>{children}</>}
      </div>
   );
};

SwipeablePanel.propTypes = {
   children: PropTypes.node,
   index: PropTypes.any.isRequired,
   value: PropTypes.any.isRequired,
};
