import { Button } from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import AddToPhotosRoundedIcon from "@mui/icons-material/AddToPhotosRounded";
import Link from "next/link";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import React, {useMemo} from "react";
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
   referrerId,
   isPastLivestreams,
   ...props
}) => {
   const classes = useStyles();
   const link = useMemo(() => ,[])
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
         <a href={`/upcoming-livestream/${livestream.id}`}>
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
