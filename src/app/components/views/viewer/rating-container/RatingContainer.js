import React, {useEffect, useState} from "react";
import {withFirebasePage} from "context/firebase";
import {Rating} from "@material-ui/lab";
import {useSnackbar} from "notistack";
import {useAuth} from "../../../../HOCs/AuthProvider";
import {FormHelperText, TextField} from "@material-ui/core";
import {fade, makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {Formik} from "formik";
import FormControl from "@material-ui/core/FormControl";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
    snackbar: {
        flexDirection: "column",
        alignItems: "flex-start",
        "& #notistack-snackbar": {
            paddingLeft: theme.spacing(2)
        },
        maxWidth: 350
    },
    action: {
        display: "flex",
        flexDirection: "column",
    },
    button: {
        marginBottom: theme.spacing(2.5),
        marginTop: theme.spacing(1)
    },
    submitButton: {
        marginRight: theme.spacing(0.5)
    },
    input: {
        marginBottom: theme.spacing(1),
        paddingRight: theme.spacing(2.5)
    },
    ratingHelper: {
        marginLeft: theme.spacing(2)
    },
    stars: {
        marginBottom: theme.spacing(1)
    },
    emptyIcon: {
        // color: fade(theme.palette.background.default, 0.5)
    },
}));

const ActionComponent = ({
                             firebase,
                             livestreamId,
                             email,
                             ratingId,
                             hasText,
                             noStars
                         }) => {
    const classes = useStyles();
    const {closeSnackbar} = useSnackbar();

    const handleFormSubmit = async (values, {setSubmitting}) => {
        setSubmitting(true)
        try {
            const newValues = {
                rating: Number(values[ratingId]),
                message: values.message
            }
            await firebase.rateLivestream(livestreamId, email, newValues, ratingId);
        } catch (e) {
        }
        setSubmitting(false)
        closeSnackbar(ratingId);
    };

    const handleDismiss = async (setSubmitting) => {
        setSubmitting(true)
        try {
            await firebase.optOutOfRating(livestreamId, email, ratingId);
        } catch (e) {
        }
        setSubmitting(false)
        closeSnackbar(ratingId);
    }

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
                    errors.message = "Please fill one"
                    errors[ratingId] = "Please fill one"
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
                    {!noStars &&
                    <Grid xl={12} lg={12} md={12} sm={12} xs={12} item>
                        <FormControl error={errors[ratingId]}>
                            <Rating
                                name={ratingId}
                                value={Number(values[ratingId])}
                                size="large"
                                className={classes.stars}
                                disabled={isSubmitting}
                                max={5}
                                classes={{iconEmpty: classes.emptyIcon}}
                                onChange={async (e) => {
                                    handleChange(e)
                                    if (!hasText) {
                                        const {currentTarget: {value}} = e
                                        await handleFormSubmit({
                                            [ratingId]: value,
                                            message: values.message
                                        }, {setSubmitting})
                                    }
                                }}
                            />
                            <FormHelperText className={classes.ratingHelper}>
                                {errors[ratingId]}
                            </FormHelperText>
                        </FormControl>
                    </Grid>}
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
                                    inputProps={{maxLength: 1000}}
                                    label="Review"
                                    onChange={handleChange}
                                    variant="outlined"
                                    className={classes.input}
                                />
                            </Grid>
                            <Grid
                                xl={12}
                                lg={12}
                                md={12}
                                sm={12}
                                xs={12}
                                item
                                className={classes.actionItems}
                            >
                                <Button
                                    disabled={isSubmitting}
                                    onClick={() => handleDismiss(setSubmitting)}
                                    className={classes.button}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    disabled={isSubmitting}
                                    onClick={handleSubmit}
                                    variant="contained"
                                    className={clsx(classes.button, classes.submitButton)}
                                >
                                    Submit
                                </Button>
                            </Grid>

                        </>
                    ) : null}

                </Grid>)}
        </Formik>

    );
};

const RatingContainer = ({firebase, livestream, livestreamId}) => {
    const {authenticatedUser} = useAuth();
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [minutesPassed, setMinutesPassed] = useState(null);
    const [ratings, setRatings] = useState([]);

    useEffect(() => {
        if (livestream?.id) {
            const unsubscribeRatings = firebase.listenToLivestreamRatings(
                livestream.id,
                async (querySnapshot) => {
                    setRatings(prevState => {
                        return querySnapshot.docs.map((doc) => {
                            const oldRating = prevState.find(
                                (ratingObj) => ratingObj.id === doc.id
                            );
                            return {
                                id: doc.id,
                                ...doc.data(),
                                hasRated: oldRating?.hasRated || false,
                            };
                        })
                    })
                }
            );
            return () => unsubscribeRatings();
        }
    }, [livestream?.id]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMinutesPassed(getMinutesPassed());
        }, 10 * 1000); // check for minutes passed every 10 seconds
        return () => clearInterval(interval);
    }, [livestream.start]);

    useEffect(() => {
        if (minutesPassed) {
            (async function () {
                await handleCheckRatings();
            })()
        }
    }, [minutesPassed, livestream.hasEnded]);

    const hasNotRatedAndTimeHasPassed = (rating) => {
        return Boolean(
            !rating.hasRated &&
            minutesPassed > rating.appearAfter &&
            authenticatedUser?.email
        )
    }

    const hasNotRatedAndNotTimeYetButStreamEndedAndRatingIsForEnd = (rating) => {
        return Boolean(
            !rating.hasRated &&
            // minutesPassed < rating.appearAfter &&
            authenticatedUser?.email &&
            // rating.isForEnd && // I dont care if rating is for end or not, just ask it when stream ends
            livestream.hasEnded
        )
    }

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
                    if ((rating.isForEnd && livestream.hasEnded) || !rating.isForEnd) {
                        // dispatch snackbar if the rating isn't for the end OR is for the end and the livstream has ender
                        enqueueSnackbar(rating.question, {
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
                        });
                    }
                }
            }
        }
    };

    const getMinutesPassed = () => {
        const now = new Date();
        if (livestream?.start?.toDate()) {
            const diff = Math.abs(now - livestream.start.toDate());
            return Math.floor(diff / 1000 / 60);
        } else {
            return null;
        }
    };

    return null;
};

export default withFirebasePage(RatingContainer);
