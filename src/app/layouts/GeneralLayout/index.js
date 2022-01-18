import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import styles from "../../materialUI/styles/layoutStyles/generalLayoutStyles";
import FooterV2 from "../../components/views/footer/FooterV2";

const useStyles = makeStyles(styles);

const drawerWidth = 300;
const GeneralLayout = ({ children, fullScreen }) => {
   const classes = useStyles();

   return (
      <div
         style={{ minHeight: fullScreen && "100vh" }}
         className={classes.root}
      >
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

export default GeneralLayout;
