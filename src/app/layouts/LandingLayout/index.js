import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import styles from "../../materialUI/styles/layoutStyles/landingLayoutStyles";
import FooterV2 from "../../components/views/footer/FooterV2";

const useStyles = makeStyles(styles);

const drawerWidth = 300;
const LandingLayout = ({ children }) => {
   const classes = useStyles();

   return (
      <div className={classes.root}>
         <TopBar />
         <NavBar drawerWidth={drawerWidth} />
         <div className={classes.wrapper}>
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

export default LandingLayout;
