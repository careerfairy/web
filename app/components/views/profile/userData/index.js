import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import UserResume from "./user-resume/UserResume"
import PersonalInfo from "./personal-info/PersonalInfo"
import { Box, Container } from "@mui/material"
import UserInterests from "./personalise/UserInterests"

const useStyles = makeStyles((theme) => ({
   paper: {
      marginTop: theme.spacing(8),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   box: {
      width: "100%", // Fix IE 11 issue.
      backgroundColor: theme.palette.background.paper,
      // marginTop: theme.spacing(3),
      borderRadius: 5,
      marginTop: 20,
   },
}))

const UserData = ({ userData }) => {
   const classes = useStyles()

   return (
      <>
         <Container component="main" maxWidth="md">
            <Box boxShadow={1} p={4} className={classes.box}>
               <PersonalInfo userData={userData} />
            </Box>
         </Container>
         <Container component="main" maxWidth="md">
            <Box boxShadow={1} p={4} className={classes.box}>
               <UserResume userData={userData} />
            </Box>
         </Container>
         <Container component="main" maxWidth="md">
            <Box boxShadow={1} p={4} className={classes.box}>
               <UserInterests userData={userData} />
            </Box>
         </Container>
      </>
   )
}

export default UserData
