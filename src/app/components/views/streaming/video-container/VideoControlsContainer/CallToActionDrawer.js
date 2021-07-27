import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
   Button,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle, Divider, Drawer, Grid, Typography
} from "@material-ui/core";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import * as actions from "store/actions"
import useMediaQuery from "@material-ui/core/useMediaQuery";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   drawerContent:{
      width: 350,
      flex: 1,
      display: "flex",
      flexDirection: "column"
   },
   fullScreenDrawerContent:{
      width: "100vw",
   },
   titleWrapper:{
      padding: theme.spacing(3)
   },
   callToActionContentWrapper:{
      padding: theme.spacing(3),
      flex: 1
   }
}));

const Content = ({ handleClose, handleSend, loading, fullScreen }) => {

   const classes = useStyles()

   return (
      <div className={clsx(classes.drawerContent, {
         [classes.fullScreenDrawerContent]: fullScreen
      })}>
         <div className={classes.titleWrapper}>
         <Typography variant="h4">
            Send a call to action
         </Typography>
         </div>
         <Divider/>
         <div className={classes.callToActionContentWrapper}>
            <Grid container spacing={3} component="form">
               <Grid xs={12} item>
                  Message
               </Grid>
               <Grid xs={12} item>
                  Button Text
               </Grid>
               <Grid xs={12} item>
                  link
               </Grid>
               <Grid xs={12} item>
                  <Button
                    disabled={loading}
                    onClick={handleSend}
                    variant="contained"
                    color="primary"
                  >
                     Send
                  </Button>
               </Grid>

            </Grid>
         {/*<DialogContent>*/}
         {/*   <DialogContentText>stufffs</DialogContentText>*/}
         {/*</DialogContent>*/}
         {/*<DialogActions>*/}
         {/*   <Button onClick={handleClose}>Close</Button>*/}

         {/*</DialogActions>*/}
         </div>
      </div>
   );
};

Content.propTypes = {
   handleClose: PropTypes.func,
   handleSend: PropTypes.func,
   loading: PropTypes.bool,
   fullScreen: PropTypes.bool
};
const CallToActionDrawer = ({ open, onClose }) => {
   const classes = useStyles();
   const theme = useTheme()
   const fullScreen = useMediaQuery(theme.breakpoints.down("xs"));
   const [loading, setLoading] = useState(false);

   const dispatch = useDispatch()

   const handleClose = () => {
      onClose();
   };

   const handleSend = async () => {
      try {
         setLoading(true);
         console.log("CTA SENT!!! ;)")
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setLoading(false);
   };

   return (
     <Drawer anchor="left" open={open} onClose={handleClose}>
         <Content
           handleSend={handleSend}
           fullScreen={fullScreen}
           loading={loading}
           handleClose={handleClose} />
     </Drawer>
     )
};

CallToActionDrawer.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool
}

export default CallToActionDrawer;

