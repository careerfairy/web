import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Avatar,
   Box,
   Button,
   Card,
   CardActions,
   CardContent,
   CardHeader,
   CardMedia,
   CircularProgress,
   Dialog,
   DialogContent,
   IconButton,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Menu,
   MenuItem,
   Typography,
} from "@material-ui/core";
import {
   getBaseUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions";
import RegistrationsIcon from "@material-ui/icons/People";
import ParticipationIcon from "@material-ui/icons/Visibility";
import JoinIcon from "@material-ui/icons/RecordVoiceOver";
import { useFirestore } from "react-redux-firebase";
import { useFirebase } from "context/firebase";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions/index";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import StreamerLinksDialog from "../../../../group/admin/events/enhanced-group-stream-card/StreamerLinksDialog";
import { streamType } from "../../../../../../types";
import ConfirmRecordingDialog from "./ConfirmRecordingDialog";

const useStyles = makeStyles((theme) => ({
   root: {
      // maxWidth: 345,
   },
   media: {
      objectFit: "contain",
      padding: theme.spacing(1),
   },
   list: {
      width: "100%",
   },
   spyButton: {
      color: `${theme.palette.common.white} !important`,
   },
   cardHeader: {
      "& .MuiCardHeader-content": {
         flex: "1 1 auto",
         width: "calc(100% - 30px)",
      },
   },
   recording: {
      fontSize: "0.8rem",
      color: "red",
      textTransform: "uppercase",
      fontWeight: 800,
   },
}));

const StreamCard = ({ stream }) => {
   const classes = useStyles();
   const firestore = useFirestore();
   const firebase = useFirebase();
   const dispatch = useDispatch();

   const [confirmRecordingDialogOpen, setConfirmRecordingDialogOpen] = useState(
      false
   );
   const [anchorEl, setAnchorEl] = React.useState(null);
   const [openStreamerLinksDialog, setOpenStreamerLinksDialog] = React.useState(
      false
   );
   const recordingRequestOngoing = useSelector(
      (state) => state.streamAdmin.recording.recordingRequestOngoing
   );

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };
   const handleOpenConfirmRecordingDialog = () => {
      setConfirmRecordingDialogOpen(true);
   };
   const handleCloseConfirmRecordingDialog = () => {
      setConfirmRecordingDialogOpen(false);
   };

   const handleJoinAsStreamer = async () => {
      try {
         const tokenDoc = await firestore.get({
            collection: "livestreams",
            doc: stream.id,
            subcollections: [
               {
                  collection: "tokens",
                  doc: "secureToken",
               },
            ],
         });
         if (tokenDoc.exists) {
            const secureToken = tokenDoc.data().value;
            const baseUrl = getBaseUrl();
            const url = `${baseUrl}/streaming/${stream.id}/joining-streamer?token=${secureToken}`;
            const newWindow = window.open(url, "_blank");
            newWindow.focus();
         } else {
            dispatch(actions.sendGeneralError("This stream has no token"));
         }
      } catch (e) {
         dispatch(actions.sendGeneralError(e));
      }
   };

   const handleStartRecording = async () => {
      dispatch(actions.handleStartRecording({ firebase, streamId: stream.id }));
   };

   const handleStopRecording = async () => {
      dispatch(actions.handleStopRecording({ firebase, streamId: stream.id }));
   };

   return (
      <Card className={classes.root}>
         <CardMedia
            component="img"
            alt="Contemplative Reptile"
            height="140"
            className={classes.media}
            image={stream.companyLogoUrl}
            title={stream.company}
         />
         <CardHeader
            className={classes.cardHeader}
            title={stream.company}
            titleTypographyProps={{ noWrap: true }}
            subheader={prettyDate(stream.start)}
            action={
               <React.Fragment>
                  <IconButton onClick={handleClick}>
                     <MoreVertIcon />
                  </IconButton>
                  {
                     <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                     >
                        <MenuItem
                           component="a"
                           target="_blank"
                           onClick={handleClose}
                           href={`https://console.firebase.google.com/u/0/project/careerfairy-e1fd9/firestore/data/~2Flivestreams~2F${stream.id}`}
                        >
                           View in firebase
                        </MenuItem>
                        <MenuItem
                           onClick={() => setOpenStreamerLinksDialog(true)}
                        >
                           Get streamer links
                        </MenuItem>
                        <MenuItem
                           disabled={recordingRequestOngoing}
                           onClick={handleOpenConfirmRecordingDialog}
                        >
                           {stream.isRecording
                              ? "Stop recording stream"
                              : "Start recording stream"}
                        </MenuItem>
                        {stream.isRecording ? (
                           <ConfirmRecordingDialog
                              confirmText="Are you sure that you want to stop recording this live stream?"
                              onConfirm={handleStopRecording}
                              open={confirmRecordingDialogOpen}
                              disabled={recordingRequestOngoing}
                              onclose={handleCloseConfirmRecordingDialog}
                           />
                        ) : (
                           <ConfirmRecordingDialog
                              confirmText="Are you sure that you want to start recording this live stream?"
                              onConfirm={handleStartRecording}
                              open={confirmRecordingDialogOpen}
                              disabled={recordingRequestOngoing}
                              onclose={handleCloseConfirmRecordingDialog}
                           />
                        )}
                     </Menu>
                  }
               </React.Fragment>
            }
         />
         <CardContent>
            {stream.isRecording && (
               <Typography className={classes.recording}>
                  Recording in progress
               </Typography>
            )}
            <List dense className={classes.list}>
               <ListItem>
                  <ListItemAvatar>
                     <Avatar>
                        <RegistrationsIcon />
                     </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                     primary="Registrations"
                     secondary={stream.registeredUsers?.length || 0}
                  />
               </ListItem>
               <ListItem>
                  <ListItemAvatar>
                     <Avatar>
                        <ParticipationIcon />
                     </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                     primary="Participating"
                     secondary={stream.participatingStudents?.length || 0}
                  />
               </ListItem>
            </List>
         </CardContent>
         <CardActions>
            <Button
               variant="contained"
               className={classes.spyButton}
               target="_blank"
               startIcon={<ParticipationIcon />}
               href={`${getBaseUrl()}/streaming/${stream.id}/viewer?spy=true`}
               color="primary"
            >
               Spy
            </Button>
            <Button
               startIcon={<JoinIcon />}
               variant="contained"
               onClick={handleJoinAsStreamer}
               color="secondary"
            >
               Join as streamer
            </Button>
         </CardActions>
         <StreamerLinksDialog
            onClose={handleClose}
            livestreamId={stream.id}
            openDialog={openStreamerLinksDialog}
            setOpenDialog={setOpenStreamerLinksDialog}
         />
         <Dialog open={recordingRequestOngoing}>
            <DialogContent>
               <Box p={3} textAlign="center">
                  <div>
                     <CircularProgress />
                  </div>
                  {stream.isRecording
                     ? "Stopping livestream recording"
                     : "Starting livestream recording"}
               </Box>
            </DialogContent>
         </Dialog>
      </Card>
   );
};

StreamCard.propTypes = {
   stream: streamType.isRequired,
};

export default StreamCard;
