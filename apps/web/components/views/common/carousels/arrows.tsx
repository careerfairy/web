import Box from "@mui/material/Box"
import { Fab } from "@mui/material"
import NextIcon from "@mui/icons-material/NavigateNextRounded"
import PrevIcon from "@mui/icons-material/NavigateBeforeRounded"
import React from "react"
import { alpha } from "@mui/material/styles"

const styles = {
   arrow: (theme) => ({
      display: {
         xs: "none !important",
         sm: "block !important",
      },
      zIndex: 1,
      "&:before": {
         display: "none !important",
      },
      "& button": {
         boxShadow: "none",
         color: theme.palette.primary.main,
         background: "transparent",
         border: `2px solid ${theme.palette.primary.main}`,
         "&:hover": {
            background: alpha(theme.palette.primary.main, 0.3),
         },
      },
   }),
}
export const SampleNextArrow = (props) => {
   const { className, onClick } = props
   return (
      <Box sx={styles.arrow} className={className}>
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

export const SamplePrevArrow = (props) => {
   const { className, onClick } = props
   return (
      <Box sx={styles.arrow} className={className}>
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
