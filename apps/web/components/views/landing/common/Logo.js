import PropTypes from "prop-types"
import React from "react"
import { Box } from "@mui/material"

const styles = {
   root: (theme, { withZoom }) => ({
      maxWidth: "100%",
      maxHeight: 60,
      transition: theme.transitions.create(["transform", "filter"], {
         duration: theme.transitions.duration.standard,
         easing: theme.transitions.easing.easeInOut,
      }),
      "&:hover": {
         transform: withZoom && `scale(1.05) rotate(0.5deg)`,
      },
   }),
   withFilter: {
      filter:
         "invert(55%) sepia(0%) saturate(1465%) hue-rotate(134deg) brightness(94%) contrast(84%) grayscale(100%)",
      "&:hover": {
         filter:
            "invert(55%) sepia(0%) saturate(1465%) hue-rotate(134deg) brightness(20%) contrast(84%) grayscale(100%)",
      },
   },
}

const LinkWrapper = ({ websiteUrl, children }) => {
   return websiteUrl ? (
      <a href={websiteUrl} target="_blank">
         {children}
      </a>
   ) : (
      <>{children}</>
   )
}

const Logo = ({
   logoUrl,
   alt,
   withFilter,
   width,
   height,
   websiteUrl,
   withZoom,
}) => {
   return (
      <LinkWrapper websiteUrl={websiteUrl}>
         <Box
            sx={[
               (theme) => styles.root(theme, { withZoom }),
               withFilter && styles.withFilter,
            ]}
            component="img"
            alt={alt}
            src={logoUrl}
            loading="lazy"
            width={width}
            height={height}
         />
      </LinkWrapper>
   )
}

Logo.propTypes = {
   alt: PropTypes.string,
   height: PropTypes.number,
   logoUrl: PropTypes.string.isRequired,
   websiteUrl: PropTypes.string,
   width: PropTypes.number,
   withFilter: PropTypes.bool,
   withZoom: PropTypes.bool,
}

export default Logo
