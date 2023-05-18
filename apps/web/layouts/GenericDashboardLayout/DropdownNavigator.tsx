import { Box, Typography } from "@mui/material"
import { INavLink } from "../types"
import { useRouter } from "next/router"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { sxStyles } from "../../types/commonTypes"
import { ChevronDown, ChevronUp } from "react-feather"
import { useGenericDashboard } from "./index"

const styles = sxStyles({
   root: {
      position: "relative",
      display: "inline-block",
      width: "fit-content",
      m: 2,
   },
   backgroundOn: {
      backgroundColor: "white",
      borderRadius: "8px 8px 0px 0px",
   },
   selector: {
      display: "flex",
      p: 1,
      alignItems: "center",
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
   const [isOpen, setIsOpen] = useState(false)
   const dropdownRef = useRef(null)
   const { navLinks } = useGenericDashboard()

   const handleClick = useCallback(() => {
      setIsOpen((prevState) => !prevState)
   }, [])

   const paths = useMemo((): INavLink[] => {
      const actualLink = navLinks.find((link) =>
         link?.childLinks?.some((childLink) => childLink.pathname === pathname)
      )
      return actualLink ? actualLink.childLinks : []
   }, [navLinks, pathname])

   useEffect(() => {
      // only add the event listener when the dropdown is opened
      if (!isOpen) return

      function handleClick(event) {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
         ) {
            setIsOpen(false)
         }
      }

      // add listener to close dropdown when clicking outside
      window.addEventListener("click", handleClick)
      // clean up listener
      return () => window.removeEventListener("click", handleClick)
   }, [isOpen])

   const handleOptionClick = useCallback(
      (option: INavLink) => {
         void push(option.pathname)
      },
      [push]
   )

   if (paths?.length) {
      const currentLink = paths.find((path) => path.pathname === pathname)

      return (
         <Box
            ref={dropdownRef}
            sx={{
               ...styles.root,
               ...(isOpen ? styles.backgroundOn : []),
            }}
         >
            <Box sx={styles.selector} onClick={handleClick}>
               <Typography sx={styles.valueTitle}>
                  {currentLink.title}
               </Typography>
               {isOpen ? <ChevronUp /> : <ChevronDown />}
            </Box>
            {isOpen ? (
               <Box sx={styles.menu}>
                  {paths.map((path) =>
                     path.pathname === currentLink.pathname ? null : (
                        <Box
                           key={path.id}
                           onClick={() => handleOptionClick(path)}
                        >
                           <Typography sx={styles.optionTitle}>
                              {path.title}
                           </Typography>
                        </Box>
                     )
                  )}
               </Box>
            ) : null}
         </Box>
      )
   }

   return null
}

export default DropdownNavigator
