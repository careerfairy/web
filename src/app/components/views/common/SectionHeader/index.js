import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import { Typography } from "@material-ui/core";
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
function SectionHeader(props) {
   const classes = useStyles({
      color: props.color,
   });
   // Render nothing if no title or subtitle
   if (!props.title && !props.subtitle) {
      return null;
   }

   return (
      <header className={clsx(classes.sectionHeader, props.className)}>
         {props.title && (
            <Typography
               gutterBottom
               className={props.titleClassName}
               align="center"
               variant="h3"
               component="h3"
               margin={20}
            >
               {props.title}
            </Typography>
         )}

         {props.subtitle && (
            <Typography align="center" component="h5" variant="subtitle1">
               <span
                  className={clsx(classes.subtitle, props.subTitleClassName)}
               >
                  {props.subtitle}
               </span>
            </Typography>
         )}
         {props.hasSearch && (
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
