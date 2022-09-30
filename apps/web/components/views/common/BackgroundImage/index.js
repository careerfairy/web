import PropTypes from "prop-types"
import React from "react"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"

const styles = {
   root: (theme, { image, opacity, imagePosition, repeat }) => ({
      backgroundImage: `url("${image}")`,
      opacity: opacity,
      backgroundPosition: imagePosition,
      backgroundSize: "cover",
      top: "0",
      left: "0",
      bottom: "0",
      right: "0",
      position: "absolute",
      ...(repeat && {
         backgroundSize: "auto",
         backgroundPosition: "0% 0%",
         backgroundRepeat: "true",
      }),
   }),
}

const BackgroundImage = ({
   image,
   opacity,
   repeat,
   className,
   backgroundImageSx,
   imagePosition = "center center",
}) => {
   const theme = useTheme()
   return (
      <Box
         className={className}
         sx={{
            ...styles.root(theme, { image, opacity, imagePosition, repeat }),
            ...backgroundImageSx,
         }}
      />
   )
}

export default BackgroundImage

BackgroundImage.propTypes = {
   image: PropTypes.string,
   opacity: PropTypes.number,
   repeat: PropTypes.bool,
}
