import React from "react";
import UserResume from "./user-resume/UserResume";
import PersonalInfo from "./personal-info/PersonalInfo";
import { Box, Container } from "@mui/material";
import UserInterests from "./personalise/UserInterests";

const styles = {
   paper: {
      marginTop: (theme) => theme.spacing(8),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   box: {
      width: "100%", // Fix IE 11 issue.
      backgroundColor: (theme) => theme.palette.background.paper,
      // marginTop: theme.spacing(3),
      borderRadius: 0.8,
      marginTop: 2,
   },
   container: { px: { xs: 0.5, sm: 1, md: 2 } },
};

const UserData = ({ userData }) => {
   return (
      <>
         <Container sx={styles.container} component="main" maxWidth="md">
            <Box boxShadow={1} p={4} sx={styles.box}>
               <PersonalInfo userData={userData} />
            </Box>
         </Container>
         <Container sx={styles.container} component="main" maxWidth="md">
            <Box boxShadow={1} p={4} sx={styles.box}>
               <UserResume userData={userData} />
            </Box>
         </Container>
         <Container sx={styles.container} component="main" maxWidth="md">
            <Box boxShadow={1} p={4} sx={styles.box}>
               <UserInterests userData={userData} />
            </Box>
         </Container>
      </>
   );
};

export default UserData;
