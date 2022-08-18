import React from "react"
import * as PropTypes from "prop-types"
import { Box } from "@mui/material"

type TabPanelProps = {
   hidden?: boolean
   className?: string
   other?: any
   index?: number
   children: JSX.Element
   height?: string
   value?: number
}

export const StyledBox = ({
   children,
   className = undefined,
}: TabPanelProps) => {
   return <Box className={className}>{children}</Box>
}

export const SimplePanel = ({ panelId, children, height, ...other }) => {
   return (
      <div {...other} id={panelId} style={{ height: "100%", ...other.style }}>
         {children}
      </div>
   )
}

export const SwipeablePanel = (props) => {
   const { children, value, index, ...other } = props

   return (
      <Box
         role="tabpanel"
         hidden={value !== index}
         id={`full-width-tabpanel-${index}`}
         aria-labelledby={`full-width-tab-${index}`}
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
