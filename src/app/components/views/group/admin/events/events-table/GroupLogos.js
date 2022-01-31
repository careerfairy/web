import React, { useCallback, useState } from "react";
import {
   Avatar,
   Box,
   Collapse,
   Divider,
   IconButton,
   List,
   ListItem,
   ListItemAvatar,
   ListItemText,
   Typography,
} from "@mui/material";
import { AvatarGroup } from '@mui/material';
import clsx from "clsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import makeStyles from '@mui/styles/makeStyles';
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
   avaGrpBtn: {
      borderRadius: theme.spacing(1),
      padding: theme.spacing(0.5),
   },
   expand: {
      transform: "rotate(0deg)",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.shortest,
      }),
   },
   expandOpen: {
      transform: "rotate(180deg)",
   },
   groupLogo: {
      width: 60,
      height: 60,
      background: theme.palette.common.white,
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   groupLogoNotStacked: {
      boxShadow: theme.shadows[2],
   },
   groupLogoStacked: {
      width: 60,
      height: 60,
   },
   listItem: {
      alignItems: "center",
   },
   groupName: {
      marginLeft: theme.spacing(0.5),
   },
}));

const GroupLogos = ({ groupsDictionary, groupIds, clicked }) => {
   const classes = useStyles();

   return (
      <Box maxWidth={200} position="relative">
         {!!groupIds.length && (
            <>
               <Box display="flex" justifyContent="space-between">
                  <AvatarGroup max={3}>
                     {groupIds.map((groupId) => {
                        const groupData = groupsDictionary[groupId];
                        return groupData ? (
                           <Avatar
                              key={groupId}
                              variant="square"
                              className={clsx(
                                 classes.groupLogo,
                                 classes.groupLogoStacked
                              )}
                              alt={groupData.universityName}
                              src={getResizedUrl(groupData.logoUrl, "xs")}
                           />
                        ) : null;
                     })}
                  </AvatarGroup>
                  <Box>
                     <IconButton
                        className={clsx(classes.expand, {
                           [classes.expandOpen]: clicked,
                        })}
                        aria-expanded={clicked}
                        aria-label="show more"
                        size="large">
                        <ExpandMoreIcon />
                     </IconButton>
                  </Box>
               </Box>
               {clicked && <Divider />}
               <Collapse in={clicked}>
                  <Box dense component={List}>
                     {groupIds.map((groupId) => {
                        const groupData = groupsDictionary[groupId];
                        return groupData ? (
                           <ListItem
                              className={classes.listItem}
                              key={groupId}
                              alignItems="flex-start"
                           >
                              <ListItemAvatar>
                                 <Avatar
                                    variant="rounded"
                                    className={clsx(
                                       classes.groupLogo,
                                       classes.groupLogoNotStacked
                                    )}
                                    alt={`${groupData.universityName}`}
                                    src={getResizedUrl(groupData.logoUrl, "xs")}
                                 >
                                    {groupData.universityName}
                                 </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                 disableTypography
                                 className={classes.groupName}
                                 primary={
                                    <Typography variant="body1">
                                       {groupData.universityName}
                                    </Typography>
                                 }
                              />
                           </ListItem>
                        ) : null;
                     })}
                  </Box>
               </Collapse>
            </>
         )}
      </Box>
   );
};

export default GroupLogos;
