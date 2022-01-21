import React from "react";
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import { styles } from "../../materialUI/styles/layoutStyles/generalLayoutStyles";
import FooterV2 from "../../components/views/footer/FooterV2";
import { Box } from "@mui/material";

const drawerWidth = 300;
const GeneralLayout = ({ children, fullScreen }) => {
   return (
      <Box
         sx={(theme) => ({
            ...styles.root(theme),
            minHeight: fullScreen && "100vh",
         })}
      >
         <TopBar />
         <NavBar drawerWidth={drawerWidth} />
         <Box sx={styles.wrapper}>
            <Box sx={styles.contentContainer}>
               <Box sx={styles.content}>
                  {children}
                  <FooterV2 />
               </Box>
            </Box>
         </Box>
      </Box>
   );
};

export default GeneralLayout;
