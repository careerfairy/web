import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import HideOnScroll from "../../../components/views/common/HideOnScroll";
import { AppBar, Toolbar } from "@mui/material";

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

   const listenScrollEvent = (e) => {
      setScrolled(Boolean(window?.scrollY > 40));
   };

   return (
      <HideOnScroll forceShow={permanent}>
         <AppBar
            className={className}
            sx={{
               // Ensures top bar's Zindex is always behind the drawer
               zIndex: (theme) => theme.zIndex.drawer - 1,
               background: "transparent",
            }}
            elevation={0}
            position={position}
            {...rest}
         >
            <Toolbar
               sx={(theme) => ({
                  display: "flex",
                  justifyContent: "space-between",
                  background: "transparent",
                  borderBottomColor: alpha(theme.palette.common.black, 0.2),
                  transition: theme.transitions.create(
                     ["background", "box-shadow", "border-bottom-color"],
                     {
                        duration: theme.transitions.duration.complex,
                        easing: theme.transitions.easing.easeInOut,
                     }
                  ),
                  ...((scrolled || !transparent) &&
                     !absolute && {
                        backgroundColor: [
                           alpha(theme.palette.common.white, 0.7),
                           "!important",
                        ],
                        borderBottom: `1px solid ${alpha(
                           theme.palette.common.black,
                           0.2
                        )}`,
                        backdropFilter: "blur(20px)",
                     }),
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
