import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import HideOnScroll from "../../../components/views/common/HideOnScroll";
import { AppBar, Toolbar } from "@mui/material";

const styles = {
   appBar: (theme) => ({
      // Ensures top bar's Zindex is always behind the drawer
      zIndex: theme.zIndex.drawer - 1,
      background: "transparent",
   }),
   toolbar: (theme) => ({
      display: "flex",
      justifyContent: "space-between",
      background: "transparent",
      borderBottomColor: alpha(theme.palette.common.black, 0.2),
      transition: theme.transitions.create(
         ["background", "box-shadow", "border-bottom-color"],
         {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
         }
      ),
   }),
   toolbarScrolled: (theme) => ({
      backgroundColor: [alpha(theme.palette.common.white, 0.7), "!important"],
      borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.2)}`,
      backdropFilter: "blur(20px)",
   }),
};
const GeneralHeader = ({
   transparent,
   children,
   permanent,
   className,
   position,
   ...rest
}) => {
   const absolute = position === "absolute";

   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {
      window.addEventListener("scroll", listenScrollEvent);
      return () => window.removeEventListener("scroll", listenScrollEvent);
   }, []);

   const showBackground = Boolean((scrolled || !transparent) && !absolute);

   const listenScrollEvent = (e) => {
      setScrolled(Boolean(window?.scrollY > 40));
   };

   return (
      <HideOnScroll forceShow={permanent}>
         <AppBar
            className={className}
            sx={styles.appBar}
            elevation={0}
            position={position}
            {...rest}
         >
            <Toolbar
               sx={[styles.toolbar, showBackground && styles.toolbarScrolled]}
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
