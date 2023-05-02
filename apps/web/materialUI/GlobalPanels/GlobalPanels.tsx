import React, { FC } from "react"
import * as PropTypes from "prop-types"
import { Box, Grow, SxProps } from "@mui/material"
import { DefaultTheme } from "@mui/styles/defaultTheme"

type StyledBoxPanelProps = {
   hidden?: boolean
   className?: string
   other?: any
   index?: number
   children: JSX.Element
   height?: string
   value?: number
   sx?: SxProps<DefaultTheme>
}

export const StyledBox = ({
   children,
   className = undefined,
   sx,
}: StyledBoxPanelProps) => {
   return (
      <Box sx={sx} className={className}>
         {children}
      </Box>
   )
}

interface TabPanelProps {
   key: any
   value: number | string
   activeValue: number | string
   [x: string]: any
}

export const TabPanel: FC<TabPanelProps> = (props) => {
   const { children, activeValue, value, ...other } = props

   return (
      <div
         role="tabpanel"
         hidden={activeValue !== value}
         id={`simple-tabpanel-${value}`}
         aria-labelledby={`simple-tab-${value}`}
         {...other}
      >
         {activeValue === value && <Box>{children}</Box>}
      </div>
   )
}

export const AnimatedTabPanel: FC<TabPanelProps> = (props) => {
   const { children, activeValue, value, ...other } = props

   return (
      <Grow
         role="tabpanel"
         hidden={activeValue !== value}
         id={`simple-tabpanel-${value}`}
         aria-labelledby={`simple-tab-${value}`}
         {...other}
         in={activeValue === value}
         unmountOnExit
         appear={false}
      >
         <Box>{children}</Box>
      </Grow>
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
