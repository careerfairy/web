import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import styles from "../../materialUI/styles/layoutStyles/landingLayoutStyles";
import FooterV2 from "../../components/views/footer/FooterV2";

const useStyles = makeStyles((theme) => ({
   ...styles(theme),
   root: {
      minHeight: "100vh",
      display: "flex",
   },
}));

const drawerWidth = 300;
const UpcomingLayout = ({ children }) => {
   const classes = useStyles();

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

export default UpcomingLayout;
