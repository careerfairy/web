import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import { Fab, Grow } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import ScrollToTopIcon from "@mui/icons-material/ExpandLessRounded"

const useStyles = makeStyles((theme) => ({
   scrollTop: {
      position: "fixed",
      bottom: "20px",
      right: "5%",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      [theme.breakpoints.down("md")]: {
         width: 50,
         height: 50,
      },
   },
}))
const ScrollToTop = ({ fontSize = "large", size }) => {
   const classes = useStyles()
   const [showScroll, setShowScroll] = useState(false)

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

   const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" })
   }

   return (
      <Grow in={showScroll}>
         <Fab
            className={classes.scrollTop}
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

ScrollToTop.propTypes = {
   fontSize: PropTypes.oneOf(["small", "medium", "large"]),
   size: PropTypes.oneOf(["small", "medium", "large"]),
}

export default ScrollToTop
