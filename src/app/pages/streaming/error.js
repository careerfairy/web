import { useState, useEffect, Fragment } from "react";
import { withFirebasePage } from "context/firebase/FirebaseServiceContext";
import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Typography } from "@mui/material";

const useStyles = makeStyles((theme) => ({
   background: {
      width: "100%",
      height: "100vh",
      backgroundColor: "#FB3640",
   },
   container: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "white",
   },
}));

function StreamingErrorPage({ firebase }) {
   const classes = useStyles();

   return (
      <>
         <div className={classes.background}>
            <div className={classes.container}>
               <Typography variant={"h4"}>Invalid Streamer Link</Typography>
               <Typography>
                  Please contact the group administrator in order to take part
                  in this stream.
               </Typography>
            </div>
         </div>
      </>
   );
}

export default withFirebasePage(StreamingErrorPage);
