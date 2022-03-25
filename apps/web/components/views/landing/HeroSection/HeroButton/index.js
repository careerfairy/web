import PropTypes from "prop-types"
import React, { useMemo } from "react"
import { alpha, useTheme } from "@mui/material/styles"
import RoundButton from "materialUI/GlobalButtons/RoundButton"
import { Box } from "@mui/material"

const styles = {
   heroBtnRoot: {
      position: "relative",
      width: "inherit",
   },
   buttonBackgroundIcon: (theme) => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "50%",
      height: "auto",
      [theme.breakpoints.down("md")]: {
         display: "none",
      },
   }),
   heroBtn: (theme, { buttonColor }) => ({
      whiteSpace: "nowrap",
      textDecoration: "none !important",
      [theme.breakpoints.down("lg")]: {
         filter: `drop-shadow(4.092px 4.39px 9.5px ${alpha(buttonColor, 0.7)})`,
      },
      filter: `drop-shadow(17.092px 15.39px 36.5px ${alpha(
         buttonColor,
         0.51
      )})`,
   }),
}

const HeroButton = ({ color, className, iconUrl, sx, ...props }) => {
   const theme = useTheme()
   const buttonColor = useMemo(() => {
      if (color === "primary") return theme.palette.primary.main
      if (color === "secondary") return theme.palette.secondary.main
      return theme.palette.grey["300"]
   }, [
      color,
      theme.palette.primary,
      theme.palette.secondary,
      theme.palette.grey,
   ])

   return (
      <Box sx={styles.heroBtnRoot}>
         {iconUrl && (
            <Box
               component="img"
               sx={styles.buttonBackgroundIcon}
               src={iconUrl}
               alt={props.children}
            />
         )}
         <RoundButton
            className={className}
            sx={{
               ...sx,
               ...styles.heroBtn(theme, { buttonColor }),
            }}
            size="large"
            color={color}
            {...props}
         />
      </Box>
   )
}

export default HeroButton

HeroButton.propTypes = {
   icon: PropTypes.node,
}
