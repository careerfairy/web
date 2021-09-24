import { Button } from "@material-ui/core";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import AddToPhotosRoundedIcon from "@material-ui/icons/AddToPhotosRounded";
import Link from "next/link";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
   actionButton: {
      borderRadius: theme.spacing(1),
      margin: theme.spacing(0.5),
      "&:disabled": {
         backgroundColor: theme.palette.background.default,
      },
   },
}));

export const AttendButton = ({
   checkIfRegistered,
   user,
   mobile,
   handleRegisterClick,
   disabled,
   attendButtonLabel,
   ...props
}) => {
   const classes = useStyles();
   return (
      <Button
         className={classes.actionButton}
         classes={{ disabled: classes.disabledButton }}
         size="large"
         style={{ marginLeft: 5 }}
         variant="contained"
         {...props}
         disabled={disabled}
         startIcon={
            user && checkIfRegistered() ? (
               <ClearRoundedIcon />
            ) : (
               <AddToPhotosRoundedIcon />
            )
         }
         color={user && checkIfRegistered() ? "default" : "primary"}
         children={attendButtonLabel}
         onClick={handleRegisterClick}
      />
   );
};

export const DetailsButton = ({
   listenToUpcoming,
   mobile,
   livestream,
   groupData,
   ...props
}) => {
   const classes = useStyles();
   return (
      <Link
         prefetch={false}
         href={{
            pathname: `/upcoming-livestream/${livestream.id}`,
            query: listenToUpcoming ? null : { groupId: groupData.groupId },
         }}
      >
         <a>
            <Button
               className={classes.actionButton}
               style={{ marginRight: 5 }}
               startIcon={<LibraryBooksIcon />}
               size="large"
               {...props}
               children="Details"
               variant="contained"
               color="secondary"
            />
         </a>
      </Link>
   );
};
