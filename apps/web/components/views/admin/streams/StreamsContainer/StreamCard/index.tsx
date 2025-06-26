import { countriesOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import {
   LivestreamEvent,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import { downloadLinkWithDate } from "@careerfairy/shared-lib/livestreams/recordings"
import { dynamicSort } from "@careerfairy/shared-lib/utils"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import RegistrationsIcon from "@mui/icons-material/People"
import PercentIcon from "@mui/icons-material/Percent"
import JoinIcon from "@mui/icons-material/RecordVoiceOver"
import ParticipationIcon from "@mui/icons-material/Visibility"
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
   FormControlLabel,
   FormGroup,
   Grid,
   IconButton,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Menu,
   MenuItem,
   Switch,
   Typography,
} from "@mui/material"
import { useRecordingViewsSWR } from "components/custom-hook/recordings/useRecordingViewsSWR"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import format from "date-fns/format"
import Image from "next/legacy/image"
import React, { forwardRef, useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useFirestore } from "react-redux-firebase"
import * as actions from "store/actions/index"
import { livestreamRepo } from "../../../../../../data/RepositoryInstances"
import { sxStyles } from "../../../../../../types/commonTypes"
import { errorLogAndNotify } from "../../../../../../util/CommonUtil"
import { useLivestreamUsersCount } from "../../../../../custom-hook/live-stream/useLivestreamUsersCount"
import { useToggleLivestreamNewUI } from "../../../../../custom-hook/live-stream/useToggleLivestreamNewUI"
import { CSVDialogDownload } from "../../../../../custom-hook/useMetaDataActions"
import {
   getBaseUrl,
   getResizedUrl,
   prettyDate,
} from "../../../../../helperFunctions/HelperFunctions"
import StreamerLinksDialog from "../../../../group/admin/events/enhanced-group-stream-card/StreamerLinksDialog"
import ConfirmRecordingDialog from "./ConfirmRecordingDialog"
import { PhoneNumbersDialog } from "./PhoneNumbersDialog"

const styles = sxStyles({
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
      padding: (theme) => theme.spacing(1),
      display: "flex",
      justifyContent: "center",
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
})

type Props = {
   isUpcoming: boolean
   stream: LivestreamEvent
   inView: boolean
}

const StreamCard = forwardRef<HTMLDivElement, Props>(
   ({ isUpcoming, stream, inView }, ref) => {
      const { count: registeredUsersCount } = useLivestreamUsersCount(
         stream.id,
         "registered"
      )

      const { count: participatingUsersCount } = useLivestreamUsersCount(
         stream.id,
         "participated"
      )

      const [
         openPhoneNumbersDialog,
         handleOpenPhoneNumbersDialog,
         handleClosePhoneNumbersDialog,
      ] = useDialogStateHandler()

      const registeredCount = registeredUsersCount ?? 0
      const participatingCount = participatingUsersCount ?? 0

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
         // @ts-ignore
         (state) => state.streamAdmin.recording.recordingRequestOngoing
      )
      const [csvDownloadData, setCsvDownloadData] = useState(null)
      const { trigger: toggleLivestreamNewUI, isMutating } =
         useToggleLivestreamNewUI(stream.id)
      const {
         totalViews,
         uniqueViewers,
         loading: recordingStatsLoading,
      } = useRecordingViewsSWR(stream.hasEnded && inView ? stream.id : null)

      const handleCloseCsvDialog = useCallback(() => {
         setCsvDownloadData(null)
      }, [])

      useEffect(() => {
         const fetchLivestreamRecordingInformation = async () => {
            if (stream?.id) {
               const results = await Promise.allSettled([
                  livestreamRepo.getLivestreamRecordingToken(stream.id),
               ])

               const [recordingToken] = results
                  .filter((result) => result.status === "fulfilled")
                  // @ts-ignore
                  .map((result) => result.value)
               // @ts-ignore
               const recordingSid = recordingToken?.sid
               if (recordingSid) {
                  setRecordingSid(recordingSid)
               }
            }
         }

         fetchLivestreamRecordingInformation().catch(errorLogAndNotify)
      }, [firebase, stream.id])

      const handleClick = useCallback((event) => {
         setAnchorEl(event.currentTarget)
      }, [])

      const handleClose = useCallback(() => {
         setAnchorEl(null)
      }, [])

      const handleCloseStreamerLinksDialog = useCallback(() => {
         setOpenStreamerLinksDialog(false)
      }, [])

      const handleOpenConfirmRecordingDialog = useCallback(() => {
         setConfirmRecordingDialogOpen(true)
      }, [])
      const handleCloseConfirmRecordingDialog = useCallback(() => {
         setConfirmRecordingDialogOpen(false)
      }, [])

      const handleJoinAsStreamer = useCallback(async () => {
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
               // @ts-ignore
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
      }, [dispatch, firestore, stream.id])

      const handleStartRecording = useCallback(async () => {
         dispatch(
            // @ts-ignore
            actions.handleStartRecording({ firebase, streamId: stream.id })
         )
      }, [dispatch, firebase, stream.id])

      const handleStopRecording = useCallback(async () => {
         dispatch(
            // @ts-ignore
            actions.handleStopRecording({ firebase, streamId: stream.id })
         )
      }, [dispatch, firebase, stream.id])

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
                  title: `Registered students for ${
                     stream.title
                  } - (${stream.start?.toDate()?.toISOString()})`,
               })
            })
      }, [stream.id, stream.start, stream.title])

      const handleToggleSmsEnabled = useCallback(
         async (_, value) => {
            await livestreamRepo.updateLivestreamSmsEnabled(stream.id, value)
         },
         [stream.id]
      )

      return (
         <Card sx={styles.root} ref={ref}>
            <CardMedia sx={styles.media} title={stream.company}>
               <Image
                  src={getResizedUrl(stream.companyLogoUrl, "md")}
                  height={140}
                  alt={stream.company}
                  objectFit="contain"
                  width={300}
               />
            </CardMedia>
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
                           <MenuItem
                              disabled={isMutating}
                              onClick={() => toggleLivestreamNewUI()}
                           >
                              {stream.useOldUI
                                 ? "Enable new stream room"
                                 : "Disable new stream room"}
                           </MenuItem>
                           {isUpcoming ? (
                              <>
                                 <MenuItem
                                    onClick={() =>
                                       setOpenStreamerLinksDialog(true)
                                    }
                                 >
                                    Get stream links
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
                           ) : null}
                           {!isUpcoming &&
                           !stream.hasEnded &&
                           stream.isRecording ? (
                              <MenuItem
                                 disabled={recordingRequestOngoing}
                                 onClick={handleOpenConfirmRecordingDialog}
                              >
                                 Stop recording stream
                              </MenuItem>
                           ) : null}
                           {!isUpcoming && recordingSid ? (
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
                           ) : null}
                           {stream.isRecording ? (
                              <ConfirmRecordingDialog
                                 confirmText="Are you sure that you want to stop recording this live stream?"
                                 onConfirm={handleStopRecording}
                                 open={confirmRecordingDialogOpen}
                                 onclose={handleCloseConfirmRecordingDialog}
                              />
                           ) : (
                              <ConfirmRecordingDialog
                                 confirmText="Are you sure that you want to start recording this live stream?"
                                 onConfirm={handleStartRecording}
                                 open={confirmRecordingDialogOpen}
                                 onclose={handleCloseConfirmRecordingDialog}
                              />
                           )}
                           <MenuItem onClick={handleOpenPhoneNumbersDialog}>
                              View phone numbers
                           </MenuItem>
                        </Menu>
                     }
                  </React.Fragment>
               }
            />
            {Boolean(openPhoneNumbersDialog) && (
               <PhoneNumbersDialog
                  stream={stream}
                  onClose={handleClosePhoneNumbersDialog}
                  open
               />
            )}
            <CardContent>
               {stream.isRecording || recordingSid ? (
                  <Typography sx={styles.recording}>
                     {stream?.hasEnded ? "Recorded" : "Recording in progress"}
                  </Typography>
               ) : null}
               <Grid container>
                  <Grid item xs={6}>
                     <List dense sx={styles.list}>
                        <ListItem>
                           <ListItemAvatar>
                              <Avatar>
                                 <RegistrationsIcon />
                              </Avatar>
                           </ListItemAvatar>
                           <ListItemText
                              primary="Registrations"
                              secondary={registeredUsersCount || 0}
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
                              secondary={participatingUsersCount || 0}
                           />
                        </ListItem>
                        {stream.hasEnded ? (
                           <ListItem>
                              <ListItemAvatar>
                                 <Avatar>
                                    <PercentIcon />
                                 </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                 primary="No Show"
                                 secondary={
                                    calculateNoShowPercentage(
                                       registeredCount,
                                       participatingCount
                                    ) + "%"
                                 }
                              />
                           </ListItem>
                        ) : null}
                     </List>
                  </Grid>
                  <Grid item xs={6}>
                     {stream.hasEnded ? (
                        <List dense sx={styles.list}>
                           <ListItem>
                              <ListItemAvatar>
                                 <Avatar>
                                    <ParticipationIcon />
                                 </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                 primary="Recording views"
                                 secondary={
                                    recordingStatsLoading ? (
                                       <CircularProgress size={13} />
                                    ) : (
                                       totalViews
                                    )
                                 }
                              />
                           </ListItem>
                           <ListItem>
                              <ListItemAvatar>
                                 <Avatar>
                                    <RegistrationsIcon />
                                 </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                 primary="Recording viewers"
                                 secondary={
                                    recordingStatsLoading ? (
                                       <CircularProgress size={13} />
                                    ) : (
                                       uniqueViewers
                                    )
                                 }
                              />
                           </ListItem>
                           <ListItem>
                              <ListItemAvatar>
                                 <Avatar>
                                    <PercentIcon />
                                 </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                 primary="Users Reached"
                                 secondary={
                                    recordingStatsLoading ? (
                                       <CircularProgress size={13} />
                                    ) : (
                                       calculateReachedUsers(
                                          registeredCount,
                                          participatingCount,
                                          uniqueViewers
                                       ) + "%"
                                    )
                                 }
                              />
                           </ListItem>
                        </List>
                     ) : null}
                  </Grid>
               </Grid>
            </CardContent>
            <CardActions>
               {!stream.hasEnded ? (
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
               ) : null}
               <FormGroup>
                  <FormControlLabel
                     control={
                        <Switch
                           defaultChecked={stream.smsEnabled}
                           onChange={handleToggleSmsEnabled}
                        />
                     }
                     label="SMS active"
                     labelPlacement="start"
                  />
               </FormGroup>
            </CardActions>
            <StreamerLinksDialog
               onClose={handleCloseStreamerLinksDialog}
               livestreamId={stream.id}
               openDialog={openStreamerLinksDialog}
               setOpenDialog={setOpenStreamerLinksDialog}
               companyName={stream.company}
               companyCountryCode={countriesOptionCodes.find(
                  (country) => country.name == stream.companyCountries?.[0]
               )}
            />
            <Dialog open={recordingRequestOngoing}>
               <DialogContent>
                  <Box sx={{ p: 3 }} textAlign="center">
                     <div>
                        <CircularProgress />
                     </div>
                     {stream.isRecording
                        ? "Stopping live stream recording"
                        : "Starting live stream recording"}
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
)

StreamCard.displayName = "StreamCard"

function formatRegisteredUsersToCSV(userLivestreamDatas: UserLivestreamData[]) {
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

function convertFromUTCToSwissTime(date: Date) {
   const zonedDate = new Date(
      date?.toLocaleString("en-US", {
         timeZone: "Europe/Zurich",
      })
   )

   return format(zonedDate, "yyyy-MM-dd HH:mm")
}

function calculateNoShowPercentage(
   registeredCount: number,
   participatingCount: number
) {
   try {
      const noShowUsers = registeredCount - participatingCount
      const number = (noShowUsers / registeredCount) * 100 || 0

      return Math.round(number)
   } catch (e) {
      return 0
   }
}

function calculateReachedUsers(
   numOfRegisteredUsers: number,
   numOfParticipatingUsers: number,
   uniqueViewers: number
) {
   const reachedUsers = numOfParticipatingUsers + (uniqueViewers ?? 0)

   const reachedUsersPercentage =
      (reachedUsers / numOfRegisteredUsers) * 100 || 0

   return Math.round(reachedUsersPercentage)
}

export default StreamCard
