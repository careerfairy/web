import Box from "@mui/material/Box"
import { Fab } from "@mui/material"
import NextIcon from "@mui/icons-material/NavigateNextRounded"
import PrevIcon from "@mui/icons-material/NavigateBeforeRounded"
import React from "react"
import { alpha, useTheme } from "@mui/material/styles"
import { IColors } from "../../../../types/commonTypes"

const styles = {
   arrow: (theme, color = "primary") => ({
      display: {
         xs: "none !important",
         lg: "block !important",
      },
      zIndex: 1,
      "&:before": {
         display: "none !important",
      },
      "& button": {
         boxShadow: "none",
         color: theme.palette[color]?.main,
         background: "transparent",
         border: `2px solid ${theme.palette[color]?.main}`,
         "&:hover": {
            background: alpha(theme.palette[color]?.main, 0.3),
         },
      },
   }),
}

export const SampleNextArrow = ({ className, onClick, color }: Props) => {
   const theme = useTheme()

   return (
      <Box sx={{ ...styles.arrow(theme, color) }} className={className}>
         <Fab
            size="small"
            onClick={onClick}
            color="primary"
            aria-label="next-testimonial"
         >
            <NextIcon />
         </Fab>
      </Box>
   )
}

export const SamplePrevArrow = ({ className, onClick, color }: Props) => {
   const theme = useTheme()

   return (
      <Box sx={{ ...styles.arrow(theme, color) }} className={className}>
         <Fab
            size="small"
            onClick={onClick}
            color="primary"
            aria-label="previous-testimonial"
         >
            <PrevIcon />
         </Fab>
      </Box>
   )
}

type Props = {
   className?: string
   onClick?: any
   color?: IColors
}
