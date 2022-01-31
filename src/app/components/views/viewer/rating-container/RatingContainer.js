import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { withFirebasePage } from "context/firebase/FirebaseServiceContext";
import { Rating } from "@mui/material";
import { useAuth } from "../../../../HOCs/AuthProvider";
import {
   Button,
   FormControl,
   FormHelperText,
   Grid,
   TextField,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Formik } from "formik";
import clsx from "clsx";
import * as actions from "../../../../store/actions";
import { getMinutesPassed } from "../../../helperFunctions/HelperFunctions";
import { useDispatch } from "react-redux";
import useStreamRef from "../../../custom-hook/useStreamRef";

const useStyles = makeStyles((theme) => ({
   snackbar: {
      flexDirection: "column",
      alignItems: "flex-start",
      "& #notistack-snackbar": {
         paddingLeft: theme.spacing(2),
      },
      maxWidth: 350,
   },
   action: {
      display: "flex",
      flexDirection: "column",
   },
   button: {
      marginBottom: theme.spacing(2.5),
      marginTop: theme.spacing(1),
   },
   submitButton: {
      marginLeft: theme.spacing(0.5),
   },
   input: {
      marginBottom: theme.spacing(1),
      paddingRight: theme.spacing(2.5),
   },
   ratingHelper: {
      marginLeft: theme.spacing(2),
   },
   stars: {
      marginBottom: theme.spacing(1),
   },
   emptyIcon: {
      // color: alpha(theme.palette.background.default, 0.5)
   },
}));

const ActionComponent = ({
   firebase,
   livestreamId,
   email,
   ratingId,
   hasText,
   noStars,
}) => {
   const classes = useStyles();
   const dispatch = useDispatch();
   const closeSnackbar = (key) => dispatch(actions.closeSnackbar(key));

   const handleFormSubmit = async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
         const newValues = {
            rating: Number(values[ratingId]),
            message: values.message,
         };
         await firebase.rateLivestream(
            livestreamId,
            email,
            newValues,
            ratingId
         );
      } catch (e) {}
      setSubmitting(false);
      closeSnackbar(ratingId);
   };

   const handleDismiss = async (setSubmitting) => {
      setSubmitting(true);
      try {
         await firebase.optOutOfRating(livestreamId, email, ratingId);
      } catch (e) {}
      setSubmitting(false);
      closeSnackbar(ratingId);
   };

   return (
      <Formik
         autoComplete="off"
         initialValues={{
            [ratingId]: 0,
            message: "",
         }}
         enableReinitialize
         validate={(values) => {
            let errors = {};
            if (!values[ratingId] && !values.message) {
               errors.message = "Please fill one";
               errors[ratingId] = "Please fill one";
            }
            return errors;
         }}
         onSubmit={handleFormSubmit}
      >
         {({
            values,
            errors,
            handleChange,
            handleSubmit,
            isSubmitting,
            setSubmitting,
         }) => (
            <Grid container>
               {!noStars && (
                  <Grid xl={12} lg={12} md={12} sm={12} xs={12} item>
                     <FormControl error={errors[ratingId]}>
                        <Rating
                           name={ratingId}
                           value={Number(values[ratingId])}
                           size="large"
                           className={classes.stars}
                           disabled={isSubmitting}
                           max={5}
                           classes={{ iconEmpty: classes.emptyIcon }}
                           onChange={async (e) => {
                              handleChange(e);
                              if (!hasText) {
                                 const {
                                    currentTarget: { value },
                                 } = e;
                                 await handleFormSubmit(
                                    {
                                       [ratingId]: value,
                                       message: values.message,
                                    },
                                    { setSubmitting }
                                 );
                              }
                           }}
                        />
                        <FormHelperText className={classes.ratingHelper}>
                           {errors[ratingId]}
                        </FormHelperText>
                     </FormControl>
                  </Grid>
               )}
               {hasText ? (
                  <>
                     <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <TextField
                           multiline
                           fullWidth
                           disabled={isSubmitting}
                           name="message"
                           value={values.message}
                           error={errors.message}
                           helperText={errors.message}
                           inputProps={{ maxLength: 1000 }}
                           label="Review"
                           onChange={handleChange}
                           variant="outlined"
                           className={classes.input}
                        />
                     </Grid>
                     <Grid xl={12} lg={12} md={12} sm={12} xs={12} item>
                        <Button
                           disabled={isSubmitting}
                           onClick={() => handleDismiss(setSubmitting)}
                           className={classes.button}
                           color="grey"
                        >
                           Cancel
                        </Button>
                        <Button
                           color="primary"
                           disabled={isSubmitting}
                           onClick={handleSubmit}
                           variant="contained"
                           className={clsx(
                              classes.button,
                              classes.submitButton
                           )}
                        >
                           Submit
                        </Button>
                     </Grid>
                  </>
               ) : null}
            </Grid>
         )}
      </Formik>
   );
};

ActionComponent.propTypes = {
   email: PropTypes.string.isRequired,
   firebase: PropTypes.object,
   hasText: PropTypes.bool.isRequired,
   livestreamId: PropTypes.string.isRequired,
   noStars: PropTypes.bool,
   ratingId: PropTypes.string.isRequired,
};

const RatingContainer = ({ firebase, livestream, livestreamId }) => {
   const { authenticatedUser } = useAuth();
   const classes = useStyles();
   const streamRef = useStreamRef();
   const dispatch = useDispatch();
   const enqueueSnackbar = (...args) =>
      dispatch(actions.enqueueSnackbar(...args));
   const [minutesPassed, setMinutesPassed] = useState(null);
   const [ratings, setRatings] = useState([]);

   useEffect(() => {
      if (livestream?.id) {
         const unsubscribeRatings = firebase.listenToLivestreamRatingsWithStreamRef(
            streamRef,
            async (querySnapshot) => {
               setRatings((prevState) => {
                  return querySnapshot.docs.map((doc) => {
                     const oldRating = prevState.find(
                        (ratingObj) => ratingObj.id === doc.id
                     );
                     return {
                        id: doc.id,
                        ...doc.data(),
                        hasRated: oldRating?.hasRated || false,
                     };
                  });
               });
            }
         );
         return () => unsubscribeRatings();
      }
   }, [livestream?.id]);

   useEffect(() => {
      const interval = setInterval(() => {
         setMinutesPassed(getMinutesPassed(livestream));
      }, 10 * 1000); // check for minutes passed every 10 seconds
      return () => clearInterval(interval);
   }, [livestream.start]);

   useEffect(() => {
      if (minutesPassed) {
         (async function () {
            await handleCheckRatings();
         })();
      }
   }, [minutesPassed, livestream.hasEnded]);

   const hasNotRatedAndTimeHasPassed = (rating) => {
      return Boolean(
         !rating.hasRated &&
            minutesPassed >= rating.appearAfter &&
            authenticatedUser?.email
      );
   };

   const hasNotRatedAndNotTimeYetButStreamEndedAndRatingIsForEnd = (rating) => {
      return Boolean(
         !rating.hasRated && authenticatedUser?.email && livestream.hasEnded
      );
   };

   const handleCheckRatings = async () => {
      for (const [index, rating] of ratings.entries()) {
         // this loop allows for easy async functions along with index
         if (
            hasNotRatedAndTimeHasPassed(rating) ||
            hasNotRatedAndNotTimeYetButStreamEndedAndRatingIsForEnd(rating)
         ) {
            // if you've already rated, dont bother making an api call
            const hasRated = await firebase.checkIfUserRated(
               livestreamId,
               authenticatedUser.email,
               rating.id
            );
            if (hasRated) {
               const newRatings = [...ratings];
               newRatings[index].hasRated = true; // mark that particular rating as already rated
               setRatings(newRatings); // set updated ratings with new has rated status
            } else {
               if (
                  (rating.isForEnd && livestream.hasEnded) ||
                  !rating.isForEnd
               ) {
                  // dispatch snackbar if the rating isn't for the end OR is for the end and the livestream has ended
                  enqueueSnackbar({
                     message: rating.question,
                     options: {
                        variant: "info",
                        persist: true,
                        preventDuplicate: true,
                        className: rating.hasText && classes.snackbar,
                        key: rating.id,
                        action: (
                           <ActionComponent
                              firebase={firebase}
                              ratingId={rating.id}
                              hasText={rating.hasText}
                              noStars={rating.noStars}
                              email={authenticatedUser.email}
                              livestreamId={livestreamId}
                           />
                        ),
                     },
                  });
               }
            }
         }
      }
   };

   return null;
};

RatingContainer.propTypes = {
   firebase: PropTypes.object,
   livestream: PropTypes.object.isRequired,
   livestreamId: PropTypes.string.isRequired,
};

export default withFirebasePage(RatingContainer);
