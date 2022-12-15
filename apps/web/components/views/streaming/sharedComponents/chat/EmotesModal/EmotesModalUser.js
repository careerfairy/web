import { useAuth } from "../../../../../../HOCs/AuthProvider"
import React, { useEffect } from "react"
import {
   Avatar,
   ListItem,
   ListItemAvatar,
   ListItemSecondaryAction,
   ListItemText,
} from "@mui/material"
import PropTypes from "prop-types"
import makeStyles from "@mui/styles/makeStyles"
import { useCurrentStream } from "../../../../../../context/stream/StreamContext"

const useStyles = makeStyles((theme) => ({
   emojiImg: {
      width: theme.spacing(3),
      height: theme.spacing(3),
   },
}))

const EmotesModalUser = ({
   displayName,
   email,
   initials,
   avatar,
   emojiSrc,
   emojiAlt,
   handleUnEmote,
   loading,
   prop,
}) => {
   const { userData } = useAuth()
   const { isStreamer } = useCurrentStream()
   const classes = useStyles()
   const [isMe, setIsMe] = React.useState(
      userData?.userEmail === email ||
         (isStreamer && email === "test@careerfairy.io")
   )

   useEffect(() => {
      setIsMe(
         userData?.userEmail === email ||
            (isStreamer && email === "test@careerfairy.io")
      )
   }, [userData, email])

   const handleClickUser = () => isMe && handleUnEmote(prop, email)

   return (
      <ListItem
         onClick={handleClickUser}
         disabled={loading}
         button={isMe}
         alignItems="flex-start"
      >
         <ListItemAvatar>
            <Avatar src={avatar} alt={initials}>
               {initials ? initials : null}
            </Avatar>
         </ListItemAvatar>
         <ListItemText
            primary={displayName}
            secondary={isMe && "Click to remove"}
         />
         <ListItemSecondaryAction>
            <img className={classes.emojiImg} alt={emojiAlt} src={emojiSrc} />
         </ListItemSecondaryAction>
      </ListItem>
   )
}

EmotesModalUser.propTypes = {
   displayName: PropTypes.string.isRequired,
   email: PropTypes.string.isRequired,
   initials: PropTypes.string.isRequired,
   avatar: PropTypes.any,
   emojiSrc: PropTypes.string,
   emojiAlt: PropTypes.string,
   handleUnEmote: PropTypes.func.isRequired,
   loading: PropTypes.bool.isRequired,
   prop: PropTypes.string.isRequired,
}
export default EmotesModalUser
