import { styled } from "@mui/material/styles"
import Tabs, { tabsClasses } from "@mui/material/Tabs"
import Tab, { tabClasses } from "@mui/material/Tab"
import React, { FC } from "react"
import Skeleton from "@mui/material/Skeleton"

type TabOption = {
   label: string
   value: string
}
type Props = {
   tabOptions: TabOption[] | readonly TabOption[]
   value: string
   disabled?: boolean
   onChange: (event: React.SyntheticEvent, value: string) => void
}
export const TabsComponent: FC<Props> = ({
   tabOptions,
   onChange,
   value,
   disabled,
}) => {
   return (
      <StyledTabs
         value={value}
         onChange={onChange}
         color={"secondary"}
         aria-label="basic tabs example"
      >
         {tabOptions.map((option) => (
            <StyledTab
               key={option.value}
               label={option.label}
               value={option.value}
               disabled={disabled}
            />
         ))}
      </StyledTabs>
   )
}

const mobileTabHeight = 33
const tabletTabHeight = 45
const borderRadius = 5
export const StyledTabs = styled(Tabs)(({ theme }) => ({
   [`& .${tabsClasses.indicator}`]: {
      top: 0,
      height: "100%",
      borderRadius: theme.spacing(borderRadius),
      zIndex: 0,
      backgroundColor: theme.palette.secondary.main,
      [theme.breakpoints.down("lg")]: {
         // make tabs smaller on tablet
         height: tabletTabHeight,
      },
      [theme.breakpoints.down("sm")]: {
         // make tabs smaller on mobile
         height: mobileTabHeight,
      },
   },
   [`& .${tabsClasses.flexContainer}`]: {
      width: "auto",
      flex: "0 1 auto",
      display: "inline-flex",
      overflow: "hidden",
      borderRadius: theme.spacing(borderRadius),
      backgroundColor: theme.palette.tertiary.main,
   },
})) as typeof Tabs

export const StyledTab = styled(Tab)(({ theme }) => ({
   zIndex: 1,
   transition: theme.transitions.create(["color", "background-color"]),
   borderRadius: theme.spacing(borderRadius),
   textTransform: "none",
   fontWeight: 600,
   color: theme.palette.grey[500],
   [`&.${tabClasses.selected}`]: {
      color: "white",
   },
   [theme.breakpoints.down("lg")]: {
      padding: theme.spacing(2, 1.2),
      // make tabs smaller on tablet
      minHeight: tabletTabHeight,
      fontSize: theme.typography.pxToRem(12),
   },
   [theme.breakpoints.down("sm")]: {
      // make tabs smaller on mobile
      minWidth: 0,
      minHeight: mobileTabHeight,
      padding: theme.spacing(0.6, 0.7),
      fontSize: theme.typography.pxToRem(10),
   },
})) as unknown as typeof Tab

const rectangularTabsBorderRadius = 1

export const StyledRectangularTabs = styled(StyledTabs)(({ theme }) => ({
   [`& .${tabsClasses.flexContainer}`]: {
      borderRadius: theme.spacing(rectangularTabsBorderRadius),
      position: "relative",
   },
   [`& .${tabsClasses.scroller}`]: {
      display: "inline-flex",
   },
   [`& .${tabsClasses.indicator}`]: {
      marginTop: "auto",
      marginBottom: "auto",
      borderRadius: theme.spacing(rectangularTabsBorderRadius),
      transform: "scale(0.85)",
      [theme.breakpoints.down("sm")]: {
         transform: "scale(0.9)",
      },
   },
})) as typeof Tabs

export const TabsSkeleton = styled(Skeleton)(({ theme }) => ({
   display: "inline-flex",
   borderRadius: theme.spacing(borderRadius),
   width: 100,
   height: tabletTabHeight,
})) as typeof Skeleton
