import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import clsx from "clsx";
import HideOnScroll from "../../../components/views/common/HideOnScroll";
import { AppBar, Toolbar } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {
      // Ensures top bar's Zindex is always above the drawer
      zIndex: theme.zIndex.drawer + 1,
      color: (props) => props.navLinksColor,
      background: "transparent",
   },
   whiteToolbar: {
      boxShadow: theme.shadows[2],
      background: (props) => [props.backgroundColor, "!important"],
   },
   toolbar: {
      display: "flex",
      justifyContent: "space-between",
      background: "transparent",
   },
   animated: {
      transition: theme.transitions.create(["background", "box-shadow"], {
         duration: theme.transitions.duration.complex,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
}));

const GeneralHeader = ({
   transparent,
   children,
   permanent,
   headerColors,
   ...rest
}) => {
   const theme = useTheme();
   const classes = useStyles({
      navLinksColor: headerColors?.navLinksColor || theme.palette.grey["800"],
      backgroundColor:
         headerColors?.backgroundColor || theme.palette.common.white,
   });

   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
      window.addEventListener("scroll", listenScrollEvent);
      return () => window.removeEventListener("scroll", listenScrollEvent);
   }, []);

   const listenScrollEvent = (e) => {
      setScrolled(Boolean(window?.scrollY > 40));
   };

   return (
      <HideOnScroll forceShow={permanent}>
         <AppBar className={classes.root} elevation={0} {...rest}>
            <Toolbar
               className={clsx(classes.toolbar, classes.animated, {
                  [classes.whiteToolbar]: scrolled || !transparent,
               })}
            >
               {children}
            </Toolbar>
         </AppBar>
      </HideOnScroll>
   );
};

GeneralHeader.propTypes = {
   children: PropTypes.node.isRequired,
   permanent: PropTypes.bool,
   transparent: PropTypes.bool,
};

export default GeneralHeader;
