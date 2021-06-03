import PropTypes from 'prop-types'
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "auto",
      height: 50,
      margin: theme.spacing(2),
      transition: theme.transitions.create(["transform", "filter"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
      "&:hover": {
         transform: "scale(1.05) rotate(0.5deg)",
      },
   },
   withFilter: {
      filter:
         "invert(55%) sepia(0%) saturate(1465%) hue-rotate(134deg) brightness(94%) contrast(84%) grayscale(100%)",
      "&:hover": {
        filter:
          "invert(55%) sepia(0%) saturate(1465%) hue-rotate(134deg) brightness(20%) contrast(84%) grayscale(100%)",
      },
   },
}));

const LinkWrapper = ({ websiteUrl, children }) => {
   return websiteUrl ? (
      <a href={websiteUrl} target="_blank">
         {children}
      </a>
   ) : (
      <>{children}</>
   );
};

const Logo = ({ logoUrl, alt, withFilter, width, height , websiteUrl}) => {
   const classes = useStyles();

   return (
      <LinkWrapper websiteUrl={websiteUrl}>
         <img
            className={clsx(classes.root, {
               [classes.withFilter]: withFilter,
            })}
            alt={alt}
            src={logoUrl}
            width={width}
            height={height}
         />
      </LinkWrapper>
   );
};

Logo.propTypes = {
  alt: PropTypes.string,
  height: PropTypes.number,
  logoUrl: PropTypes.string.isRequired,
  websiteUrl: PropTypes.string,
  width: PropTypes.number,
  withFilter: PropTypes.bool
}

export default Logo;
