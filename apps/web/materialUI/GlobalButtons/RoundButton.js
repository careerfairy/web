import PropTypes from "prop-types"
import React, { useMemo } from "react"
import { alpha, useTheme } from "@mui/material/styles"
import { Button } from "@mui/material"
import { combineStyles } from "types/commonTypes"

const paddingSize = 4
const paddingXFactor = 0.5
const mobileFactor = 0.8
const styles = {
   root: (theme) => ({
      padding: `${paddingSize * paddingXFactor}em ${paddingSize}em`,
      borderRadius: `${paddingSize}em`,
      [theme.breakpoints.down("sm")]: {
         padding: `${paddingSize * paddingXFactor * mobileFactor}em ${
            paddingSize * mobileFactor
         }em`,
         borderRadius: `${paddingSize * mobileFactor}em`,
      },
   }),
   withGradient: (theme, { colors }) => ({
      background: `linear-gradient(-24deg, ${colors[0]} 1%, ${colors[1]} 100%)`,
      color: theme.palette.common.white,
      "&:hover": {
         boxShadow: `0 3px 5px 2px  ${alpha(colors[1], 0.3)}`,
      },
   }),
}

const RoundButton = ({ withGradient, className, color, sx, ...props }) => {
   const {
      palette: { primary, secondary, grey },
   } = useTheme()
   const colors = useMemo(() => {
      if (color === "primary") {
         return [primary.main, primary.gradient]
      }
      if (color === "secondary") {
         return [secondary.main, secondary.gradient]
      }

      return [grey["300"], grey["700"]]
   }, [color, primary, secondary, grey])

   return (
      <Button
         color={color}
         className={className}
         sx={combineStyles(
            styles.root,
            sx,
            withGradient
               ? (theme) => styles.withGradient(theme, { colors })
               : undefined
         )}
         {...props}
      />
   )
}

export default RoundButton

RoundButton.propTypes = {
   className: PropTypes.string,
   withGradient: PropTypes.bool,
}
