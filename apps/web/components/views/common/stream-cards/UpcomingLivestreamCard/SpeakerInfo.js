import PropTypes from "prop-types"
import React from "react"
import { Avatar, Box, Typography } from "@mui/material"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import { speakerPlaceholder } from "../../../../util/constants"

const styles = {
   root: (theme) => ({
      display: "flex",
      padding: theme.spacing(0.5, 0.5, 0.5, 0),
      flexWrap: "nowrap",
      alignItems: "center",
   }),
   speakerAvatar: (theme) => ({
      width: theme.spacing(6),
      height: theme.spacing(6),
   }),
   speakerInfoWrapper: {
      paddingLeft: (theme) => theme.spacing(2),
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   speakerName: {
      fontWeight: 600,
      textOverflow: "ellipsis",
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 1,
      WebkitLineClamp: 1,
      wordBreak: "break-word",
      overflow: "hidden",
   },
   speakerPosition: {
      textOverflow: "ellipsis",
      display: "-webkit-box",
      boxOrient: "vertical",
      lineClamp: 1,
      WebkitLineClamp: 1,
      wordBreak: "break-word",
      overflow: "hidden",
   },
}

const SpeakerInfo = ({ speaker }) => {
   return (
      <Box sx={styles.root}>
         <Avatar
            src={getResizedUrl(speaker.avatar, "xs") || speakerPlaceholder}
            alt={`${speaker.firstName || ""} - ${
               speaker.lastName || ""
            } - avatar`}
            imgProps={{ loading: "lazy" }}
            sx={styles.speakerAvatar}
         />
         <Box sx={styles.speakerInfoWrapper}>
            <Typography variant="h6" align="left" sx={styles.speakerName}>
               {speaker.firstName}
            </Typography>
            <Typography
               variant="subtitle1"
               align="left"
               color="textSecondary"
               sx={styles.speakerPosition}
            >
               {speaker.position}
            </Typography>
         </Box>
      </Box>
   )
}

SpeakerInfo.propTypes = {
   speaker: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      avatar: PropTypes.string,
      position: PropTypes.string,
   }),
}

export default SpeakerInfo
