import {
   Avatar,
   CircularProgress,
   ListItem,
   ListItemAvatar,
   ListItemText,
} from "@mui/material"
import React from "react"
import Typography from "@mui/material/Typography"

const ChannelMember = ({ memberData, index, members, style }) => {
   const itemLoading = index === members.length

   const content = itemLoading ? (
      <CircularProgress />
   ) : (
      <React.Fragment>
         <ListItemAvatar>
            <Avatar alt={memberData.initials} src={memberData.avatarUrl}>
               {memberData.initials}
            </Avatar>
         </ListItemAvatar>
         <ListItemText
            disableTypography
            primary={
               <Typography noWrap variant="body1">
                  {memberData.displayName}
               </Typography>
            }
            secondary={memberData.speakerUuid ? "Streamer" : "Viewer"}
         />
      </React.Fragment>
   )
   return (
      <ListItem
         style={style}
         // button
         alignItems="flex-start"
      >
         {content}
      </ListItem>
   )
}

export default ChannelMember
