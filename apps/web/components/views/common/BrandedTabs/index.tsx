import { Box, BoxProps, Typography, styled } from "@mui/material"
import { LinkProps } from "next/link"
import { Fragment, ReactNode, createContext, useContext, useMemo } from "react"
import Link from "../Link"

const TabsContainer = styled(Box)({
   display: "flex",
   flexDirection: "row",
   alignItems: "center",
   gap: 16,
   padding: 12,
   width: "100%",
})

const TabButton = styled(Box, {
   shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ isActive, theme }) => ({
   display: "flex",
   alignItems: "center",
   gap: 8,
   padding: 12,
   borderRadius: 8,
   cursor: "pointer",
   textDecoration: "none",
   backgroundColor: isActive ? theme.brand.purple[50] : "transparent",
   border: isActive ? "1px solid #9580F0" : "1px solid transparent",
   transition: theme.transitions.create("background-color"),
   "&:hover": {
      backgroundColor: isActive ? "#F0EDFD" : "rgba(0, 0, 0, 0.04)",
   },
}))

const TabIcon = styled(Box, {
   shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ isActive }) => ({
   width: 24,
   height: 24,
   "& svg": {
      width: "100%",
      height: "100%",
      stroke: isActive ? "#6749EA" : "#3D3D47",
      strokeWidth: 2,
   },
}))

const TabText = styled(Typography, {
   shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ isActive, theme }) => ({
   fontSize: 16,
   fontWeight: isActive ? 600 : 400,
   color: isActive ? theme.palette.secondary.main : theme.palette.neutral[800],
   textAlign: "center",
   whiteSpace: "nowrap",
}))

type TabContextType<T extends string | number = string | number> = {
   activeValue: T
   onChange: (event: React.SyntheticEvent, newValue: T) => void
}

const TabContext = createContext<TabContextType>({
   activeValue: null,
   onChange: () => {},
})

type TabProps<T extends string | number = string | number> = {
   label: string
   icon?: ReactNode
   value: T
} & BoxProps &
   (
      | {
           href: LinkProps["href"]
           shallow?: LinkProps["shallow"]
        }
      | {
           href?: never
           shallow?: never
        }
   )

const Tab = <T extends string | number = string | number>({
   label,
   icon,
   href,
   value,
   shallow,
   ...props
}: TabProps<T>) => {
   const { activeValue, onChange } = useContext(TabContext)
   const isActive = value === activeValue

   return (
      <TabButton
         isActive={isActive}
         component={href ? Link : "button"}
         {...(href ? { href, shallow } : {})}
         onClick={(e) => {
            if (href) {
               return // let Link handle the click
            } else {
               return onChange(e, value)
            }
         }}
         {...props}
      >
         <Fragment>
            {icon ? <TabIcon isActive={isActive}>{icon}</TabIcon> : null}
            <TabText isActive={isActive}>{label}</TabText>
         </Fragment>
      </TabButton>
   )
}

type BrandedTabsProps<T extends string | number = string | number> = {
   activeValue: T
   onChange: (event: React.SyntheticEvent, newValue: T) => void
} & Omit<BoxProps, "onChange">

export const BrandedTabs = <T extends string | number = string | number>({
   children,
   activeValue,
   onChange,
   ...props
}: BrandedTabsProps<T>) => {
   const value: TabContextType<T> = useMemo(
      () => ({ activeValue, onChange }),
      [activeValue, onChange]
   )

   return (
      <TabContext.Provider value={value}>
         <TabsContainer {...props}>{children}</TabsContainer>
      </TabContext.Provider>
   )
}

BrandedTabs.Tab = Tab
