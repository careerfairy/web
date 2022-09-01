import PropTypes from "prop-types"
import React from "react"
import { Box, Typography } from "@mui/material"
import GeneralSearch from "../GeneralSearch"
import { useTheme } from "@mui/material/styles"

const styles = {
   sectionHeader: (theme, { color }) => ({
      color: color,
      // Add bottom margin if element below
      "&:not(:last-child)": {
         marginBottom: "3rem",
      },
   }),
   searchWrapper: {
      marginTop: (theme) => theme.spacing(5),
   },
   subtitle: {
      // Subtitle text generally isn't very long
      // so usually looks better to limit width.
      maxWidth: "700px",
      // So we can have max-width but still
      // have alignment controlled by text-align.
      display: "inline-block",
   },
}

//
function SectionHeader({
   className,
   color,
   hasSearch,
   subTitleClassName,
   subtitle,
   title,
   titleClassName,
   subTitleSx,
   titleSx,
   subTitleVariant = "subtitle1",
   titleVariant = "h3",
   sx,
}) {
   const theme = useTheme()
   // Render nothing if no title or subtitle
   if (!title && !subtitle) {
      return null
   }
   return (
      <Box
         component="header"
         sx={{ ...styles.sectionHeader(theme, { color }), ...sx }}
         className={className}
      >
         {title && (
            <Typography
               gutterBottom
               className={titleClassName}
               align="center"
               sx={titleSx}
               variant={titleVariant}
               component="h3"
            >
               {title}
            </Typography>
         )}

         {subtitle && (
            <Typography align="center" component="h5" variant={subTitleVariant}>
               <Box
                  component="span"
                  sx={{ ...styles.subtitle, ...subTitleSx }}
                  className={subTitleClassName}
               >
                  {subtitle}
               </Box>
            </Typography>
         )}
         {hasSearch && (
            <Box sx={styles.searchWrapper}>
               <GeneralSearch />
            </Box>
         )}
      </Box>
   )
}

SectionHeader.propTypes = {
   className: PropTypes.string,
   subtitle: PropTypes.string,
   title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
   subTitleClassName: PropTypes.string,
   titleClassName: PropTypes.string,
   color: PropTypes.string,
   sx: PropTypes.object,
   hasSearch: PropTypes.bool,
   subTitleSx: PropTypes.object,
   titleSx: PropTypes.object,
}

export default SectionHeader
