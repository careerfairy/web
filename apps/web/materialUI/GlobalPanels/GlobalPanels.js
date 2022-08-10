import React from "react"
import * as PropTypes from "prop-types"
import { Box } from "@mui/material"

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
   )
}

export const SimplePanel = ({ panelId, children, height, ...other }) => {
   return (
      <div {...other} id={panelId} style={{ height: "100%", ...other.style }}>
         {children}
      </div>
   )
}

export const SwipeablePanel = ({
   children,
   value,
   index,
   dir = undefined,
   ...other
}) => {
   return (
      <Box
         role="tabpanel"
         hidden={value !== index}
         id={`full-width-tabpanel-${index}`}
         aria-labelledby={`full-width-tab-${index}`}
         dir={dir}
         {...other}
      >
         {value === index && <>{children}</>}
      </Box>
   )
}

export const swipeableTabA11yProps = (index) => {
   return {
      id: `full-width-tabpanel-${index}`,
      "aria-controls": `full-width-tab-${index}`,
   }
}

SwipeablePanel.propTypes = {
   children: PropTypes.node,
   index: PropTypes.any.isRequired,
   value: PropTypes.any.isRequired,
}
