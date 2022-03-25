import React from "react"
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import Fade from "@stahl.luke/react-reveal/Fade"

import MicIcon from "@mui/icons-material/Mic"
import WifiIcon from "@mui/icons-material/Wifi"

const chromeLogo =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Fchrome.svg?alt=media&token=516e705a-bafa-4a43-99f7-e184cc85b557"
const edgeLogo =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/random-logos%2Fedge.svg?alt=media&token=f4165230-170e-454f-9fca-adea53798b9f"

const useStyles = makeStyles((theme) => ({
   icons: {
      margin: "20px 20px 20px 20px",
   },
   svg: {
      width: 60,
      margin: "0 10px",
   },
   root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   boldText: {
      fontWeight: 800,
      fontStyle: "normal",
   },
   bottomText: {
      paddingBottom: "20px",
   },
   list: {
      padding: "5px 20px",
      fontSize: "1rem",
   },
   icon: {
      marginRight: "5px",
   },
}))
const Step1Chrome = ({
   isCompleted,
   handleMarkComplete,
   isChromium,
   localStream,
}) => {
   const classes = useStyles()

   if (!isChromium) {
      return (
         <>
            <Typography align="center" variant="h5">
               <b>This browser is not supported for streaming</b>
            </Typography>
            <Box
               display="flex"
               flexDirection="column"
               alignItems="center"
               m={1}
               elevation={2}
            >
               <div className={classes.icons}>
                  <img
                     style={{ marginBottom: 10 }}
                     alt="chrome logo"
                     className={classes.svg}
                     src={chromeLogo}
                  />
                  <img
                     style={{ marginBottom: 10 }}
                     alt="edge logo"
                     className={classes.svg}
                     src={edgeLogo}
                  />
               </div>
               <Typography className={classes.bottomText} align="center">
                  Please use a supported browser like the latest{" "}
                  <em className={classes.boldText}>Google Chrome</em> (v. 80 and
                  newer) or{" "}
                  <em className={classes.boldText}>Chromium Microsoft Edge</em>{" "}
                  (v. 79 or newer).
               </Typography>
            </Box>
         </>
      )
   }

   return (
      <>
         {/*<Typography gutterBottom align="center" variant="h4"><b>Preparation</b></Typography>*/}
         <Typography align="left" variant="subtitle1">
            Please follow these couple of instructions:
         </Typography>
         <ul className={classes.list}>
            <li>
               <MicIcon style={{ marginRight: "10px" }} />
               Make sure that your webcam and/or microphone are not currently
               used by any other application.
            </li>
            <li>
               <WifiIcon style={{ marginRight: "10px" }} />
               If possible, avoid connecting through any VPN or corporate
               network with restrictive firewall rules.
            </li>
         </ul>
         <FormControlLabel
            style={{ margin: "0 auto" }}
            control={
               <Checkbox
                  name="agreeTerm"
                  placeholder="Confirm Password"
                  onChange={handleMarkComplete}
                  value={isCompleted}
                  checked={isCompleted}
                  color="primary"
               />
            }
            label={
               <Typography>
                  I have understood and will follow these instructions
               </Typography>
            }
         />
         {!localStream && (
            <Fade delay={5000} enter={!localStream} collapse bottom>
               <div
                  style={{
                     width: "100%",
                     display: "flex",
                     justifyContent: "center",
                  }}
               >
                  <Typography
                     style={{
                        textAlign: "center",
                        color: "#00d2aa",
                        width: "70%",
                        fontWeight: "bold",
                     }}
                  >
                     Please allow CareerFairy to access your camera and
                     microphone in order to proceed.
                  </Typography>
               </div>
            </Fade>
         )}
         {/*<Button onClick={handleComplete} color="primary" variant="contained" fullWidth>*/}
         {/*    I agree to use Google Chrome as a browser*/}
         {/*</Button>*/}
      </>
   )
}

export default Step1Chrome
