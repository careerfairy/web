import React, { useEffect, useState } from "react"
import { Fab, Grow } from "@mui/material"
import ScrollToTopIcon from "@mui/icons-material/ExpandLessRounded"
import { sxStyles } from "../../../types/commonTypes"
import { scrollTop } from "../../../util/CommonUtil"
import useIsMobile from "../../custom-hook/useIsMobile"

const styles = sxStyles({
   scrollTop: {
      position: "fixed",
      bottom: "20px",
      right: "5%",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      width: {
         xs: 50,
         md: 56,
      },
      height: {
         xs: 50,
         md: 56,
      },
   },
})

type Props = {
   fontSize?: "inherit" | "large" | "medium" | "small"
   size?: "small" | "medium" | "large"
   hasBottomNavBar?: boolean
}

const ScrollToTop = ({ fontSize = "large", size, hasBottomNavBar }: Props) => {
   const [showScroll, setShowScroll] = useState(false)
   const isMobile = useIsMobile()

   useEffect(() => {
      window.addEventListener("scroll", checkScrollTop)
      return () => window.removeEventListener("scroll", checkScrollTop)
   }, [showScroll])

   const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
         setShowScroll(true)
      } else if (showScroll && window.pageYOffset <= 400) {
         setShowScroll(false)
      }
   }

   return (
      <Grow in={showScroll}>
         <Fab
            sx={[
               styles.scrollTop,
               hasBottomNavBar && isMobile ? { bottom: "90px" } : null,
            ]}
            onClick={scrollTop}
            color="primary"
            size={size}
            aria-label="scroll-to-top"
         >
            <ScrollToTopIcon fontSize={fontSize} />
         </Fab>
      </Grow>
   )
}

export default ScrollToTop
