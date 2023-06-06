import { Box, Menu, MenuItem, MenuProps, Typography } from "@mui/material"
import { INavLink } from "../types"
import { useRouter } from "next/router"
import React, { useCallback, useMemo, useState } from "react"
import { sxStyles } from "../../types/commonTypes"
import { ChevronDown, ChevronUp } from "react-feather"
import { useGenericDashboard } from "./index"
import { styled } from "@mui/material/styles"

const styles = sxStyles({
   root: {
      position: "relative",
      display: "inline-block",
      width: "fit-content",
      m: 2,
   },
   backgroundOn: {
      backgroundColor: "white",
      zIndex: 99,
      borderRadius: "8px 8px 0px 0px",
   },
   selector: {
      display: "flex",
      p: 1,
      ml: 2,
      alignItems: "center",
      width: "240px",
   },
   menu: {
      position: "absolute",
      display: "inline-block",
      zIndex: 99,
      width: "100%",
      backgroundColor: "white",
      borderRadius: "0px 0px 8px 8px",
      p: 1,
      py: 2,
   },
   valueTitle: {
      fontWeight: 600,
      fontSize: 20,
      mr: 1,
   },
   optionTitle: {
      fontWeight: 500,
      fontSize: 20,
      color: "#676767",
   },
})

const DropdownNavigator = () => {
   const { pathname, push } = useRouter()
   const { navLinks } = useGenericDashboard()
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
   const isOpen = useMemo(() => Boolean(anchorEl), [anchorEl])
   const paths = useMemo((): INavLink[] => {
      const actualLink = navLinks.find((link) =>
         link?.childLinks?.some((childLink) => childLink.pathname === pathname)
      )
      return actualLink ? actualLink.childLinks : []
   }, [navLinks, pathname])
   const showIcon = useMemo(() => paths.length > 1, [paths])

   const handleOptionClick = useCallback(
      (option: INavLink) => {
         void push(option.pathname)
      },
      [push]
   )

   const handleOpen = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
         // do not open the dropdown if there's no other path to show
         if (paths.length <= 1) return

         setAnchorEl(event.currentTarget)
      },
      [paths.length]
   )

   const handleClose = useCallback(() => {
      setAnchorEl(null)
   }, [])

   if (paths?.length) {
      const currentLink = paths.find((path) => path.pathname === pathname)

      return (
         <>
            <Box
               sx={[styles.selector, isOpen ? styles.backgroundOn : null]}
               onClick={handleOpen}
            >
               <Typography sx={styles.valueTitle}>
                  {currentLink.title}
               </Typography>
               {showIcon ? isOpen ? <ChevronUp /> : <ChevronDown /> : null}
            </Box>
            <StyledMenu
               id="demo-customized-menu"
               MenuListProps={{
                  "aria-labelledby": "demo-customized-button",
               }}
               anchorEl={anchorEl}
               open={isOpen}
               onClose={handleClose}
            >
               {paths.map((path) =>
                  path.pathname === currentLink.pathname ? null : (
                     <MenuItem
                        key={path.id}
                        onClick={() => handleOptionClick(path)}
                        disableRipple
                     >
                        <Typography sx={styles.optionTitle}>
                           {path.title}
                        </Typography>
                     </MenuItem>
                  )
               )}
            </StyledMenu>
         </>
      )
   }

   return null
}

export default DropdownNavigator

const StyledMenu = styled((props: MenuProps) => (
   <Menu
      anchorOrigin={{
         vertical: "bottom",
         horizontal: "left",
      }}
      transformOrigin={{
         vertical: "top",
         horizontal: "right",
      }}
      {...props}
   />
))(() => ({
   "& .MuiPaper-root": {
      backgroundColor: "white",
      filter: "none",
      borderRadius: "0px 0px 8px 8px",
      width: "240px",
   },
   "& .MuiMenuItem-root": {
      backgroundColor: "white !important",
   },
}))
