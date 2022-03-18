import React, { useEffect, useState } from "react";
import {
   Avatar,
   Box,
   Button,
   Card,
   CardActions,
   CardContent,
   CardHeader,
   CardMedia,
   Chip,
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
} from "@mui/material";
import {
   getBaseUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions";
import RegistrationsIcon from "@mui/icons-material/People";
import ParticipationIcon from "@mui/icons-material/Visibility";
import JoinIcon from "@mui/icons-material/RecordVoiceOver";
import { useFirestore } from "react-redux-firebase";
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions/index";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StreamerLinksDialog from "../../../../group/admin/events/enhanced-group-stream-card/StreamerLinksDialog";
import ConfirmRecordingDialog from "./ConfirmRecordingDialog";
import PropTypes from "prop-types";

const styles = {
   root: {
      position: "relative",
   },
   chipContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      p: 1,
      display: "flex",
      flexWrap: "wrap",
      "& .MuiChip-root": {
         opacity: 0.9,
      },
   },
   media: {
      objectFit: "contain",
      padding: (theme) => theme.spacing(1),
   },
   list: {
      width: "100%",
   },
   spyButton: {
      color: (theme) => `${theme.palette.common.white} !important`,
      mr: 1,
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
};

const StreamCard = ({ isUpcoming, stream }) => {
   const firestore = useFirestore();
   const firebase = useFirebaseService();
   const dispatch = useDispatch();
   const [recordingSid, setRecordingSid] = useState(false);
   const [confirmRecordingDialogOpen, setConfirmRecordingDialogOpen] =
      useState(false);
   const [anchorEl, setAnchorEl] = React.useState(null);
   const [openStreamerLinksDialog, setOpenStreamerLinksDialog] =
      React.useState(false);
   const recordingRequestOngoing = useSelector(
      (state) => state.streamAdmin.recording.recordingRequestOngoing
   );

   useEffect(async () => {
      if (stream?.id) {
         const tokenDoc = await firebase.getLivestreamRecordingSid(stream.id);
         const recordingSid = tokenDoc.data()?.sid;
         if (recordingSid) {
            setRecordingSid(recordingSid);
         }
      }
   }, [stream?.id]);

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
      <Card sx={styles.root}>
         <CardMedia
            component="img"
            alt="Contemplative Reptile"
            height="140"
            sx={styles.media}
            image={stream.companyLogoUrl}
            title={stream.company}
         />
         <CardHeader
            sx={styles.cardHeader}
            title={stream.company}
            titleTypographyProps={{ noWrap: true }}
            subheader={prettyDate(stream.start)}
            action={
               <React.Fragment>
                  <IconButton onClick={handleClick} size="large">
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
                           View in Firestore
                        </MenuItem>
                        {isUpcoming && (
                           <>
                              <MenuItem
                                 onClick={() =>
                                    setOpenStreamerLinksDialog(true)
                                 }
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
                           </>
                        )}
                        {!isUpcoming && stream.isRecording && (
                           <MenuItem
                              disabled={recordingRequestOngoing}
                              onClick={handleOpenConfirmRecordingDialog}
                           >
                              Stop recording stream
                           </MenuItem>
                        )}
                        {!isUpcoming && recordingSid && (
                           <MenuItem
                              component="a"
                              target="_blank"
                              onClick={handleClose}
                              href={`https://agora-cf-cloud-recordings.s3.eu-central-1.amazonaws.com/directory1/directory5/${recordingSid}_${stream.id}_0.mp4`}
                           >
                              Download Recording
                           </MenuItem>
                        )}
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
               <Typography sx={styles.recording}>
                  {stream?.hasEnded ? "Recorded" : "Recording in progress"}
               </Typography>
            )}
            <List dense sx={styles.list}>
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
               sx={styles.spyButton}
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
               <Box sx={{ p: 3 }} textAlign="center">
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
   stream: PropTypes.object,
   isUpcoming: PropTypes.bool,
};

export default StreamCard;
