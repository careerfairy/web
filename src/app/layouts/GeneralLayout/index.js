import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import styles from "../../materialUI/styles/layoutStyles/generalLayoutStyles";
import FooterV2 from "../../components/views/footer/FooterV2";

const useStyles = makeStyles(styles);

const drawerWidth = 300;
const GeneralLayout = ({
   children,
   fullScreen,
   navLinksProps,
   headerProps,
   noPaddingTop,
}) => {
   const classes = useStyles();

   return (
      <div
         style={{ minHeight: fullScreen && "100vh" }}
         className={classes.root}
      >
         <TopBar headerProps={headerProps} navLinksProps={navLinksProps} />
         <NavBar drawerWidth={drawerWidth} />
         <div
            style={{ paddingTop: noPaddingTop && "0 !important" }}
            className={classes.wrapper}
         >
            <div className={classes.contentContainer}>
               <div className={classes.content}>
                  {children}
                  <FooterV2 />
               </div>
            </div>
         </div>
      </div>
   );
};

export default GeneralLayout;
