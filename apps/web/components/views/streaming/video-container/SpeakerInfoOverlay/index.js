import React, { useCallback } from "react"
import { alpha } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import PropTypes from "prop-types"
import dynamic from "next/dynamic"
import { IconButton, Tooltip } from "@mui/material"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import RubberBand from "@stahl.luke/react-reveal/RubberBand"
import { useSelector } from "react-redux"
import { dataLayerEvent } from "../../../../../util/analyticsUtils"

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
   speakerAction: {
      marginLeft: 5,
   },
   speakerActionIconButton: {
      padding: 0,
   },
   speakerActionButton: {
      color: theme.palette.common.white,
      fontSize: (props) => (props.small ? 17 : 25),
   },
}))

const SpeakerInfoOverlay = ({ speaker, small, zIndex }) => {
   const [DialogComponent, setDialogComponent] = React.useState(null)
   const animateProfileIcons = useSelector(
      (state) => state.stream.layout.animateProfileIcons
   )

   const closeDialog = useCallback(async () => {
      setDialogComponent(null)
   }, [])

   const openDialog = useCallback(async () => {
      const SpeakerDetailsDialog = dynamic(() =>
         import("./SpeakerDetailsDialog")
      )
      setDialogComponent(SpeakerDetailsDialog)
      dataLayerEvent("livestream_see_details_about_speaker")
   }, [])

   const classes = useStyles({ small: small, zIndex })

   let NameHeader = "h3"
   let PositionHeader = "h4"

   if (small) {
      NameHeader = "h5"
      PositionHeader = "h5"
   }

   return (
      <>
         <div className={classes.speakerInformation}>
            <div className={small ? classes.speakerData : undefined}>
               <div>
                  <NameHeader
                     className={classes.speakerName}
                  >{`${speaker.firstName} ${speaker.lastName}`}</NameHeader>
               </div>
               <div>
                  <PositionHeader
                     className={classes.speakerPosition}
                  >{`${speaker.position}`}</PositionHeader>
               </div>
            </div>
            <div className={classes.speakerAction}>
               <Tooltip title={`See details about this speaker`}>
                  <IconButton
                     className={classes.speakerActionIconButton}
                     onClick={openDialog}
                     size="large"
                  >
                     <RubberBand spy={animateProfileIcons} count={2}>
                        <AccountCircleOutlinedIcon
                           className={classes.speakerActionButton}
                        />
                     </RubberBand>
                  </IconButton>
               </Tooltip>
            </div>
         </div>
         {DialogComponent && (
            <DialogComponent onClose={closeDialog} speaker={speaker} />
         )}
      </>
   )
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
