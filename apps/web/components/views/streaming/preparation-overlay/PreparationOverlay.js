import React, { useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { isEmpty } from "lodash/fp"
import {
   Button,
   CircularProgress,
   Collapse,
   Container,
   FormControl,
   FormControlLabel,
   FormGroup,
   Paper,
   Switch,
   TextField,
   Typography,
} from "@mui/material"
import WarningIcon from "@mui/icons-material/Warning"
import { URL_REGEX } from "components/util/constants"
import usePreparationOverlay from "../../../custom-hook/usePreparationOverlay"
import { useRouter } from "next/router"
import { useTheme } from "@mui/material/styles"
import { useAuth } from "../../../../HOCs/AuthProvider"

const useStyles = makeStyles((theme) => ({
   background: {
      // width: "100%",
      height: "100vh",
      backgroundColor: theme.palette.primary.main,
      color: "white",
      display: "grid",
      placeItems: "center",
   },
   centered: {
      // position: "absolute",
      // top: "50%",
      // left: "50%",
      // transform: "translate(-50%,-50%)",
      // minWidth: 400
   },
   speakerTitle: {
      fontSize: "1rem",
      textTransform: "uppercase",
      fontWeight: "bold",
      marginBottom: 10,
   },
   speakerName: {
      fontSize: "1.3rem",
      fontWeight: "bold",
   },
   select: {
      minWidth: 200,
   },
   selectNewProfile: {
      padding: "10px 0",
      textTransform: "uppercase",
      fontWeight: "bold",
      fontSize: "1rem",
      margin: 5,
      color: theme.palette.text.secondary,
   },
   selectNewProfileIcon: {
      color: theme.palette.text.secondary,
   },
   speakerFunction: {
      fontSize: "1rem",
      color: theme.palette.text.secondary,
   },
   title: {
      marginBottom: 20,
   },
   company: {
      fontWeight: "bold",
   },
   padding: {
      padding: "20px 30px",
      margin: "20px 0",
   },
   linkedInSwitch: {
      margin: "20px 0 10px 0",
      fontSize: "0.1rem",
      fontWeight: "bold",
   },
   linkedIn: {
      width: "100%",
   },
   block: {
      display: "block",
   },
   button: {
      marginTop: 10,
      color: "lightgrey",
   },
   marginTop: {
      marginTop: 10,
   },
   browserMessage: {
      marginTop: 30,
      fontSize: "1rem",
      fontWeight: "bold",
      fontStyle: "normal",
      verticalAlign: "middle",
      em: {
         verticalAlign: "middle",
      },
   },
   subline: {
      marginRight: 5,
      verticalAlign: "middle",
   },
}))

function PreparationOverlay({ livestream, streamerUuid, setStreamerReady }) {
   const classes = useStyles()
   const { updateSpeaker, addSpeaker } = usePreparationOverlay()
   const { userData } = useAuth()

   const {
      query: { auto },
   } = useRouter()
   const [speaker, setSpeaker] = useState({
      firstName: "",
      lastName: "",
      position: "",
   })
   const {
      palette: { mode },
   } = useTheme()

   const [showLinkedIn, setShowLinkedIn] = useState(true)
   const [linkedInUrl, setLinkedInUrl] = useState("")
   const [formErrors, setFormErrors] = useState({})
   const [loading, setLoading] = useState(false)

   useEffect(() => {
      let storedSpeakerString = localStorage.getItem("storedSpeaker")
      if (storedSpeakerString) {
         let currentSpeaker
         if (livestream.liveSpeakers?.length > 0) {
            let storedSpeaker = JSON.parse(storedSpeakerString)
            let savedSpeaker = livestream.liveSpeakers?.find((liveSpeaker) => {
               return (
                  liveSpeaker.firstName === storedSpeaker.firstName &&
                  liveSpeaker.lastName === storedSpeaker.lastName &&
                  liveSpeaker.position === storedSpeaker.position
               )
            })
            if (savedSpeaker) {
               currentSpeaker = savedSpeaker
            } else {
               currentSpeaker = storedSpeaker
            }
         } else {
            currentSpeaker = JSON.parse(storedSpeakerString)
         }
         if (currentSpeaker.showLinkedIn !== undefined) {
            setShowLinkedIn(Boolean(currentSpeaker.showLinkedIn))
         }

         if (currentSpeaker?.linkedIn) {
            setLinkedInUrl(currentSpeaker.linkedIn)
         }
         setSpeaker(currentSpeaker)
      }
   }, [livestream.liveSpeakers])

   const handleChangeLinkedInShare = (event) => {
      setShowLinkedIn(!showLinkedIn)
   }

   const joinStream = (e) => {
      e.preventDefault()
      setLoading(true)
      if (!formHasErrors()) {
         let newSpeaker = { ...speaker }
         newSpeaker.speakerUuid = streamerUuid
         newSpeaker.showLinkedIn = showLinkedIn
         newSpeaker.linkedIn = linkedInUrl

         if (userData?.authId) {
            // user is logged in, save the user id
            newSpeaker.userId = userData.authId
         }

         if (newSpeaker.id) {
            updateSpeaker(newSpeaker).then(() => {
               setStreamerReady(true)
               setLoading(false)
            })
         } else {
            addSpeaker(newSpeaker).then(() => {
               setStreamerReady(true)
               setLoading(false)
            })
         }
         localStorage.setItem("storedSpeaker", JSON.stringify(newSpeaker))
      } else {
         setLoading(false)
      }
   }

   const formHasErrors = () => {
      let errors = {}
      if (showLinkedIn) {
         errors.linkedInUrl =
            isEmpty(linkedInUrl?.trim()) || !isValidUrl(linkedInUrl)
      }
      errors.firstName = isEmpty(speaker.firstName?.trim())
      errors.lastName = isEmpty(speaker.lastName?.trim())
      errors.position = isEmpty(speaker.position?.trim())
      setFormErrors(errors)
      return Object.keys(errors).some((key) => errors[key] === true)
   }

   const isValidUrl = (value) => {
      return value.match(URL_REGEX)
   }

   return (
      <Container maxWidth={false} className={classes.background}>
         <form onSubmit={joinStream} className={classes.centered}>
            <Typography variant="h5" className={classes.title}>
               Welcome to your stream
            </Typography>
            <Typography variant="h4">{livestream.title}</Typography>
            <Typography variant="h5" className={classes.company}>
               {livestream.company}
            </Typography>
            <Paper className={classes.padding}>
               <Typography
                  color="textSecondary"
                  variant="h4"
                  sx={{
                     color: "text.primary",
                  }}
                  className={classes.speakerTitle}
               >
                  Your Speaker Profile
               </Typography>
               <FormGroup>
                  <FormGroup>
                     <FormControl className={classes.marginTop}>
                        <TextField
                           error={
                              formErrors.firstName &&
                              isEmpty(speaker.firstName?.trim())
                           }
                           helperText={formErrors.firstName && "Required"}
                           id="outlined-basic"
                           label="First Name"
                           variant="outlined"
                           name="firstName"
                           value={speaker.firstName || ""}
                           onChange={(event) =>
                              setSpeaker({
                                 ...speaker,
                                 firstName: event.target.value,
                              })
                           }
                        />
                     </FormControl>
                     <FormControl className={classes.marginTop}>
                        <TextField
                           error={
                              formErrors.lastName &&
                              isEmpty(speaker.lastName?.trim())
                           }
                           helperText={formErrors.lastName && "Required"}
                           id="outlined-basic"
                           label="Last Name"
                           variant="outlined"
                           name="lastName"
                           value={speaker.lastName || ""}
                           onChange={(event) =>
                              setSpeaker({
                                 ...speaker,
                                 lastName: event.target.value,
                              })
                           }
                        />
                     </FormControl>
                     <FormControl className={classes.marginTop}>
                        <TextField
                           error={
                              formErrors.position &&
                              isEmpty(speaker.position?.trim())
                           }
                           helperText={formErrors.position && "Required"}
                           id="outlined-basic"
                           label="Occupation"
                           placeholder="Lead Engineer"
                           name="jobTitle"
                           value={speaker.position || ""}
                           variant="outlined"
                           onChange={(event) =>
                              setSpeaker({
                                 ...speaker,
                                 position: event.target.value,
                              })
                           }
                        />
                     </FormControl>
                  </FormGroup>
                  <FormControlLabel
                     className={classes.linkedInSwitch}
                     control={
                        <Switch
                           checked={showLinkedIn}
                           onChange={handleChangeLinkedInShare}
                           color="primary"
                           size="small"
                        />
                     }
                     label={
                        showLinkedIn
                           ? "Click To Hide LinkedIn Profile"
                           : "Click to Show LinkedIn Profile"
                     }
                  />
                  <Collapse in={showLinkedIn}>
                     <FormControl className={classes.linkedIn}>
                        <TextField
                           required={showLinkedIn}
                           label="LinkedIn Profile URL"
                           name="linkedInUrl"
                           placeholder="https://linkedin.com/in/your-profile"
                           value={linkedInUrl || ""}
                           helperText={
                              formErrors.linkedInUrl &&
                              "Please enter a valid URL"
                           }
                           error={
                              formErrors.linkedInUrl && !isValidUrl(linkedInUrl)
                           }
                           onChange={(event) =>
                              setLinkedInUrl(event.target.value)
                           }
                           variant="outlined"
                        />
                     </FormControl>
                  </Collapse>
               </FormGroup>
            </Paper>
            <Button
               variant="contained"
               type="submit"
               size="large"
               sx={(theme) => ({
                  bgcolor: theme.palette.background.paper,
                  "&:hover": {
                     backgroundColor: theme.palette.background.default,
                  },
                  color:
                     theme.palette.mode === "dark"
                        ? "white !important"
                        : "black !important",
               })}
               onClick={joinStream}
               disabled={loading}
               startIcon={loading && <CircularProgress size="small" />}
            >
               Join now
            </Button>
            <Typography className={classes.browserMessage} variant="h5">
               <WarningIcon className={classes.subline} />
               <em>
                  Please avoid connecting through a mobile device (iOS/Android)
               </em>
            </Typography>
         </form>
      </Container>
   )
}

export default PreparationOverlay
