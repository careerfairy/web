import { Fragment, useState, useEffect } from "react";
import makeStyles from '@mui/styles/makeStyles';

import { useFirebase, withFirebase } from "context/firebase";
import UserResume from "components/views/profile/userData/user-resume/UserResume";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
   Dialog,
   DialogContent,
   ButtonGroup,
   Button,
   Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import * as actions from "store/actions";

const useStyles = makeStyles((theme) => ({
   iconInButton: {
      color: ({ hasStarted }) =>
         hasStarted ? theme.palette.error.main : theme.palette.primary.main,
   },
   container: {
      textAlign: "center",
      padding: 30,
   },
   title: {
      fontSize: "1.3rem",
      margin: 20,
      lineHeight: "2rem",
      "& em": {
         fontWeight: "bold",
      },
   },
   bigIcon: {
      fontSize: "5.0rem",
      color: theme.palette.primary.main,
      margin: 15,
   },
   buttons: {
      marginTop: 20,
   },
   companyLogo: {
      maxWidth: "150px",
   },
   icon: {
      fontSize: "4rem",
   },
}));

function JoinTalentPoolModal({
   livestream,
   userData,
   modalOpen,
   setModalOpen,
}) {
   const firebase = useFirebase();
   const classes = useStyles();
   const [withCV, setWithCV] = useState(undefined);
   const [loading, setLoading] = useState(false);

   const dispatch = useDispatch();

   useEffect(() => {
      if (withCV !== undefined) {
         setLoading(true);
         firebase
            .joinCompanyTalentPool(
               livestream.companyId,
               userData,
               livestream.id
            )
            .then(() => {
               setLoading(false);
            })
            .catch((error) => {
               setLoading(false);
            });
      }
   }, [withCV]);

   useEffect(() => {
      if (modalOpen === true) {
         setWithCV(undefined);
      }
   }, [modalOpen]);

   const handleShareCvSelection = (value) => {
      dispatch(actions.editUserProfile({ shareResume: value }));
      setWithCV(value);
   };

   const ShareCVSelect = ({}) => {
      return (
         <div className={classes.container}>
            <div className={classes.description}>
               <img
                  className={classes.companyLogo}
                  src={livestream.companyLogoUrl}
               />
            </div>
            <Typography className={classes.title} variant="h4">
               Would you like to share your CV when joining the Talent Pool ?
            </Typography>
            <ButtonGroup size="large" className={classes.buttons}>
               <Button onClick={() => handleShareCvSelection(true)}>Yes</Button>
               <Button onClick={() => handleShareCvSelection(false)}>No</Button>
            </ButtonGroup>
         </div>
      );
   };

   const UserResumeContainer = ({}) => {
      return (
         <div>
            <UserResume userData={userData} />
            <Button onClick={() => handleShareCvSelection(false)}>Skip</Button>
         </div>
      );
   };

   const JoiningConfirmation = ({}) => {
      return (
         <div className={classes.container}>
            <div className={classes.description}>
               <CheckCircleOutlineIcon
                  className={classes.icon}
                  color="primary"
               />
            </div>
            <Typography className={classes.title} variant="h4">
               Thank you for the joining the talent pool!
            </Typography>
            <Button onClick={() => setModalOpen(false)}>Close</Button>
         </div>
      );
   };

   return (
      <Fragment>
         <Dialog style={{ zIndex: "9999" }} open={modalOpen}>
            <DialogContent>
               {withCV === undefined && <ShareCVSelect />}
               {withCV === true && !userData?.userResume && (
                  <UserResumeContainer />
               )}
               {(withCV === false ||
                  (withCV === true && userData?.userResume)) && (
                  <JoiningConfirmation />
               )}
            </DialogContent>
         </Dialog>
      </Fragment>
   );
}

export default JoinTalentPoolModal;
