import React from "react"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import PropTypes from "prop-types"
import { IconButton, Tooltip } from "@mui/material"

const useStyles = makeStyles((theme) => ({
   speakerInformation: {
      position: "absolute",
      left: (props) => (props.small ? 10 : 40),
      bottom: (props) => (props.small ? 10 : 40),
      padding: (props) => (props.small ? 6 : 15),
      borderRadius: (props) => (props.small ? 5 : 10),
      textAlign: "left",
      color: theme.palette.common.white,
      boxShadow: theme.shadows[2],
      backgroundColor: alpha(theme.palette.common.black, 0.4),
      backdropFilter: "blur(5px)",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      maxWidth: (props) => (props.small ? "230px" : "100%"),
      zIndex: (props) => props.zIndex,
   },
   speakerName: {
      fontSize: (props) => (props.small ? "0.7rem" : "1rem"),
      maxWidth: (props) => (props.small ? "180px" : "100%"),
      margin: 0,
   },
   speakerData: {
      maxWidth: (props) => (props.small ? "180px" : "100%"),
   },
   speakerPosition: {
      fontWeight: "normal",
      fontSize: (props) => (props.small ? "0.6rem" : "1rem"),
      maxWidth: (props) => (props.small ? "180px" : "100%"),
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      margin: 0,
   },
   speakerLinkedIn: {
      marginLeft: 10,
   },
   speakerLinkedInIconButton: {
      padding: 0,
   },
   speakerLinkedInButton: {
      color: theme.palette.common.white,
      fontSize: (props) => (props.small ? 20 : 30),
   },
}))

const SpeakerInfoOverlay = ({ speaker, small, zIndex }) => {
   const classes = useStyles({ small: small, zIndex })

   const handleClick = () => {
      let url = speaker.linkedIn
      if (!url.match(/^[a-zA-Z]+:\/\//)) {
         url = "https://" + url
      }
      window.open(url, "_blank")
   }

   if (small) {
      return (
         <div className={classes.speakerInformation}>
            <div className={classes.speakerData}>
               <div>
                  <h5
                     className={classes.speakerName}
                  >{`${speaker.firstName} ${speaker.lastName}`}</h5>
               </div>
               <div>
                  <h5
                     className={classes.speakerPosition}
                  >{`${speaker.position}`}</h5>
               </div>
            </div>
            {speaker.showLinkedIn && (
               <div className={classes.speakerLinkedIn}>
                  <Tooltip
                     title={`Open ${speaker.firstName}'s LinkedIn profile in a new tab`}
                  >
                     <IconButton
                        className={classes.speakerLinkedInIconButton}
                        onClick={handleClick}
                        size="large"
                     >
                        <LinkedInIcon
                           className={classes.speakerLinkedInButton}
                        />
                     </IconButton>
                  </Tooltip>
               </div>
            )}
         </div>
      )
   } else {
      return (
         <div className={classes.speakerInformation}>
            <div>
               <div>
                  <h3
                     className={classes.speakerName}
                  >{`${speaker.firstName} ${speaker.lastName}`}</h3>
               </div>
               <div>
                  <h4
                     className={classes.speakerPosition}
                  >{`${speaker.position}`}</h4>
               </div>
            </div>
            {speaker.showLinkedIn && (
               <div className={classes.speakerLinkedIn}>
                  <Tooltip
                     title={`Open ${speaker.firstName}'s LinkedIn profile in a new tab`}
                  >
                     <IconButton
                        className={classes.speakerLinkedInIconButton}
                        onClick={handleClick}
                        size="large"
                     >
                        <LinkedInIcon
                           className={classes.speakerLinkedInButton}
                        />
                     </IconButton>
                  </Tooltip>
               </div>
            )}
         </div>
      )
   }
}
SpeakerInfoOverlay.prototypes = {
   speaker: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      position: PropTypes.string,
   }).isRequired,
   small: PropTypes.bool.isRequired,
   zIndex: PropTypes.number,
}
export default SpeakerInfoOverlay
