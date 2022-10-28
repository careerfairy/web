import PropTypes from "prop-types"
import React from "react"
import { Box } from "@mui/material"
import BackgroundImage from "../BackgroundImage"

const styles = {
   section: (theme, { big, backgroundColor }) => ({
      transition: theme.transitions.create(["background", "color"], {
         easing: theme.transitions.easing.easeInOut,
         duration: theme.transitions.duration.standard,
      }),
      background: backgroundColor,
      display: "block",
      position: "relative",
      [theme.breakpoints.up("sm")]: {
         paddingTop: big ? "160px" : "60px",
         paddingBottom: big ? "160px" : "60px",
      },
      [theme.breakpoints.down("md")]: {
         paddingTop: "48px",
         paddingBottom: "48px",
      },
   }),
}
const Section = (props) => {
   const {
      color,
      backgroundImage,
      backgroundImageOpacity,
      backgroundImageRepeat,
      backgroundImagePosition,
      backgroundImageSx,
      children,
      backgroundColor,
      backgroundImageClassName = undefined,
      big,
      className,
      sectionRef = undefined,
      sectionId = "",
      sx,
      // Passed to section element
      ...otherProps
   } = props

   return (
      <Box
         component="section"
         className={className}
         sx={[(theme) => styles.section(theme, { big, backgroundColor }), sx]}
         ref={sectionRef}
         id={sectionId}
         {...otherProps}
      >
         {props.children}
         {backgroundImage && (
            <BackgroundImage
               className={backgroundImageClassName}
               imagePosition={backgroundImagePosition}
               backgroundImageSx={backgroundImageSx}
               image={backgroundImage}
               opacity={backgroundImageOpacity}
               repeat={backgroundImageRepeat}
            />
         )}
      </Box>
   )
}
Section.propTypes = {
   backgroundImage: PropTypes.string,
   backgroundImageOpacity: PropTypes.number,
   backgroundImageRepeat: PropTypes.bool,
   backgroundImageClassName: PropTypes.string,
   backgroundColor: PropTypes.string,
   children: PropTypes.any,
   color: PropTypes.string,
   big: PropTypes.bool,
   className: PropTypes.string,
   sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
   sectionRef: PropTypes.any,
   sectionId: PropTypes.any,
}

export default Section
