import React, { useCallback, useEffect, useState } from "react"
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
} from "@mui/material"
import {
   getBaseUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions"
import RegistrationsIcon from "@mui/icons-material/People"
import ParticipationIcon from "@mui/icons-material/Visibility"
import JoinIcon from "@mui/icons-material/RecordVoiceOver"
import { useFirestore } from "react-redux-firebase"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { useDispatch, useSelector } from "react-redux"
import * as actions from "store/actions/index"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import StreamerLinksDialog from "../../../../group/admin/events/enhanced-group-stream-card/StreamerLinksDialog"
import ConfirmRecordingDialog from "./ConfirmRecordingDialog"
import PropTypes from "prop-types"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/dist/livestreams/recordings"
import PercentIcon from "@mui/icons-material/Percent"
import { CSVDialogDownload } from "../../../../../custom-hook/useMetaDataActions"
import { format } from "date-fns"
import { livestreamRepo } from "../../../../../../data/RepositoryInstances"
import { dynamicSort } from "@careerfairy/shared-lib/dist/utils"

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
}

const StreamCard = ({ isUpcoming, stream }) => {
   const firestore = useFirestore()
   const firebase = useFirebaseService()
   const dispatch = useDispatch()
   const [recordingSid, setRecordingSid] = useState(null)
   const [confirmRecordingDialogOpen, setConfirmRecordingDialogOpen] =
      useState(false)
   const [anchorEl, setAnchorEl] = React.useState(null)
   const [openStreamerLinksDialog, setOpenStreamerLinksDialog] =
      React.useState(false)
   const recordingRequestOngoing = useSelector(
      (state) => state.streamAdmin.recording.recordingRequestOngoing
   )
   const [csvDownloadData, setCsvDownloadData] = useState(null)

   const handleCloseCsvDialog = useCallback(() => {
      setCsvDownloadData(null)
   }, [])

   useEffect(async () => {
      if (stream?.id) {
         const tokenDoc = await firebase.getLivestreamRecordingSid(stream.id)
         const recordingSid = tokenDoc.data()?.sid
         if (recordingSid) {
            setRecordingSid(recordingSid)
         }
      }
   }, [stream?.id])

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget)
   }

   const handleClose = () => {
      setAnchorEl(null)
   }
   const handleOpenConfirmRecordingDialog = () => {
      setConfirmRecordingDialogOpen(true)
   }
   const handleCloseConfirmRecordingDialog = () => {
      setConfirmRecordingDialogOpen(false)
   }

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
         })
         if (tokenDoc.exists) {
            const secureToken = tokenDoc.data().value
            const baseUrl = getBaseUrl()
            const url = `${baseUrl}/streaming/${stream.id}/joining-streamer?token=${secureToken}`
            const newWindow = window.open(url, "_blank")
            newWindow.focus()
         } else {
            dispatch(actions.sendGeneralError("This stream has no token"))
         }
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
   }

   const handleStartRecording = async () => {
      dispatch(actions.handleStartRecording({ firebase, streamId: stream.id }))
   }

   const handleStopRecording = async () => {
      dispatch(actions.handleStopRecording({ firebase, streamId: stream.id }))
   }

   /**
    * Download CSV with information about the registered users
    * Useful to check the registration dates and try to understand the no show rates
    */
   const handleRegisteredUsersDownload = useCallback(() => {
      livestreamRepo
         .getLivestreamUsers(stream.id, "registered")
         .then((students) => {
            setCsvDownloadData({
               data: formatRegisteredUsersToCSV(students),
               title: `Registered students for ${stream.title} - (${stream.start
                  ?.toDate()
                  ?.toISOString()})`,
            })
         })
   }, [stream.id])

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
                        <MenuItem onClick={handleRegisteredUsersDownload}>
                           Download Registered Users CSV
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
                        {!isUpcoming && !stream.hasEnded && stream.isRecording && (
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
                              href={downloadLinkWithDate(
                                 stream.start.toDate(),
                                 stream.id,
                                 recordingSid
                              )}
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
            {(stream.isRecording || recordingSid) && (
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
               {stream.hasEnded && (
                  <ListItem>
                     <ListItemAvatar>
                        <Avatar>
                           <PercentIcon />
                        </Avatar>
                     </ListItemAvatar>
                     <ListItemText
                        primary="No Show"
                        secondary={calculateNoShowPercentage(stream) + "%"}
                     />
                  </ListItem>
               )}
            </List>
         </CardContent>
         <CardActions>
            {!stream.hasEnded && (
               <>
                  <Button
                     variant="contained"
                     sx={styles.spyButton}
                     target="_blank"
                     startIcon={<ParticipationIcon />}
                     href={`${getBaseUrl()}/streaming/${
                        stream.id
                     }/viewer?spy=true`}
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
               </>
            )}
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
         <CSVDialogDownload
            title="Export Table Entries"
            data={csvDownloadData?.data}
            filename={`${csvDownloadData?.title}.csv`}
            defaultOpen={!!csvDownloadData}
            onClose={handleCloseCsvDialog}
         />
      </Card>
   )
}

function formatRegisteredUsersToCSV(userLivestreamDatas) {
   const DATE_FIELD = "Registered Date (Swiss Time)"
   return userLivestreamDatas
      .map((data) => ({
         "First Name": data.user.firstName,
         "Last Name": data.user.lastName,
         [DATE_FIELD]: data.registered.date?.toDate(),
         Attended: data?.participated?.date ? "Yes" : "No",
         Email: data.user.userEmail,
         University: data.user.university?.name,
         "University Country": data.user.universityCountryCode,
      }))
      .sort(dynamicSort(DATE_FIELD))
      .map((student) => ({
         ...student,
         [DATE_FIELD]: convertFromUTCToSwissTime(student[DATE_FIELD]),
      }))
}

function convertFromUTCToSwissTime(date) {
   const zonedDate = new Date(
      date?.toLocaleString("en-US", {
         timeZone: "Europe/Zurich",
      })
   )

   return format(zonedDate, "yyyy-MM-dd HH:mm")
}

function calculateNoShowPercentage(stream) {
   try {
      const noShowUsers =
         stream.registeredUsers?.length - stream.participatingStudents?.length
      const number = (noShowUsers / stream.registeredUsers?.length) * 100

      return Math.round(number)
   } catch (e) {
      return 0
   }
}

StreamCard.propTypes = {
   stream: PropTypes.object,
   isUpcoming: PropTypes.bool,
}

export default StreamCard
