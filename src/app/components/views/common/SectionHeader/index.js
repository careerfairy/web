import PropTypes from "prop-types";
import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import { Typography } from "@mui/material";
import GeneralSearch from "../GeneralSearch";

const useStyles = makeStyles((theme) => ({
   sectionHeader: {
      color: (props) => props.color,
      // Add bottom margin if element below
      "&:not(:last-child)": {
         marginBottom: "3rem",
      },
   },
   searchWrapper: {
      marginTop: theme.spacing(5),
   },
   subtitle: {
      // Subtitle text generally isn't very long
      // so usually looks better to limit width.
      maxWidth: "700px",
      // So we can have max-width but still
      // have alignment controlled by text-align.
      display: "inline-block",
   },
}));

//
function SectionHeader({
   className,
   color,
   hasSearch,
   subTitleClassName,
   subtitle,
   title,
   titleClassName,
   subTitleVariant = "subtitle1",
   titleVariant = "h3",
}) {
   const classes = useStyles({
      color: color,
   });
   // Render nothing if no title or subtitle
   if (!title && !subtitle) {
      return null;
   }
   return (
      <header className={clsx(className, classes.sectionHeader)}>
         {title && (
            <Typography
               gutterBottom
               className={titleClassName}
               align="center"
               variant={titleVariant}
               component="h3"
            >
               {title}
            </Typography>
         )}

         {subtitle && (
            <Typography align="center" component="h5" variant={subTitleVariant}>
               <span className={clsx(classes.subtitle, subTitleClassName)}>
                  {subtitle}
               </span>
            </Typography>
         )}
         {hasSearch && (
            <div className={classes.searchWrapper}>
               <GeneralSearch />
            </div>
         )}
      </header>
   );
}

SectionHeader.propTypes = {
   className: PropTypes.string,
   subtitle: PropTypes.string,
   title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
   subTitleClassName: PropTypes.string,
   titleClassName: PropTypes.string,
   color: PropTypes.string,
};

export default SectionHeader;
