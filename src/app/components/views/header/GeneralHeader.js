import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { alpha, makeStyles, useTheme } from "@material-ui/core/styles";
import clsx from "clsx";
import HideOnScroll from "../../../components/views/common/HideOnScroll";
import { AppBar, Toolbar } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {
      // Ensures top bar's Zindex is always above the drawer
      zIndex: theme.zIndex.drawer + 1,
      color: (props) => props.navLinksActiveColor,
      background: "transparent",
   },
   transparentToolbar: {
      // boxShadow: theme.shadows[1],
      backgroundColor: [alpha(theme.palette.common.white, 0.7), "!important"],
      borderBottom: `1px solid transparent`,
      backdropFilter: "blur(20px)",
   },
   toolbar: {
      display: "flex",
      justifyContent: "space-between",
      background: "transparent",
      borderBottomColor: alpha(theme.palette.common.black, 0.2),
   },
   animated: {
      transition: theme.transitions.create(
         ["background", "box-shadow", "border-bottom-color"],
         {
            duration: theme.transitions.duration.complex,
            easing: theme.transitions.easing.easeInOut,
         }
      ),
   },
}));

const GeneralHeader = ({
   transparent,
   children,
   permanent,
   headerColors,
   className,
   position,
   ...rest
}) => {
   const theme = useTheme();
   const absolute = position === "absolute";
   const classes = useStyles({
      navLinksActiveColor:
         headerColors?.navLinksActiveColor || theme.palette.grey["800"],
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
         <AppBar
            className={clsx(classes.root, className)}
            elevation={0}
            position={position}
            {...rest}
         >
            <Toolbar
               className={clsx(classes.toolbar, classes.animated, {
                  [classes.transparentToolbar]:
                     (scrolled || !transparent) && !absolute,
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
