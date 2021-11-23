import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import styles from "../../materialUI/styles/layoutStyles/landingLayoutStyles";
import FooterV2 from "../../components/views/footer/FooterV2";

const useStyles = makeStyles(styles);

const drawerWidth = 300;
const LandingLayout = ({ topImage, bottomImage, children }) => {
   const classes = useStyles({ topImage, bottomImage });

   return (
      <div className={classes.root}>
         <TopBar />
         <NavBar anchor="left" drawerWidth={drawerWidth} />
         <div className={classes.wrapper}>
            <div className={classes.contentContainer}>
               <div className={classes.content}>
                  {children}
                  <FooterV2 background={"transparent"} />
               </div>
            </div>
         </div>
      </div>
   );
};

export default LandingLayout;
