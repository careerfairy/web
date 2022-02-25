import { Button } from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import AddToPhotosRoundedIcon from "@mui/icons-material/AddToPhotosRounded";
import Link from "next/link";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import React from "react";
import makeStyles from "@mui/styles/makeStyles";

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
      <span>
         <Button
            className={classes.actionButton}
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
            color={user && checkIfRegistered() ? "grey" : "primary"}
            children={attendButtonLabel}
            onClick={handleRegisterClick}
         />
      </span>
   );
};

export const DetailsButton = ({
   listenToUpcoming,
   mobile,
   livestream,
   groupData,
   referrerId,
   isPastLivestreams,
   ...props
}) => {
   const classes = useStyles();
   return (
      <Link
         href={{
            pathname: `/upcoming-livestream/${livestream.id}`,
            hash: isPastLivestreams && "#about",
            query: {
               ...(!listenToUpcoming && { groupId: groupData.groupId }),
               ...(referrerId && { referrerId }),
            },
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
