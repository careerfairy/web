import React, {useEffect, useState} from "react";
import {withFirebasePage} from "context/firebase";
import {Rating} from "@material-ui/lab";
import {useSnackbar} from "notistack";
import {useAuth} from "../../../../HOCs/AuthProvider";
import {TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme) => ({
    snackbar: {
        flexDirection: "column",
    },
    action: {
        display: "flex",
        flexDirection: "column",
    },
    button: {
        marginBottom: theme.spacing(1)
    },
    input: {
        marginBottom: theme.spacing(1)
    },
}));

const ActionComponent = ({
                             firebase,
                             question,
                             livestreamId,
                             email,
                             ratingId,
                             hasText,
                         }) => {
    const classes = useStyles();
    const {closeSnackbar} = useSnackbar();
    const [data, setData] = useState({rating: 0, message: ""});
    const [submitting, setSubmitting] = useState(false);

    const handleRatingChange = async ({currentTarget: {value}}) => {
        const ratingNumber = Number(value)
        if (hasText) {
            setData({...data, rating: ratingNumber});
        } else {
            await handleSubmit({rating: ratingNumber})
        }
    };
    const handleMessageChange = ({currentTarget: {value}}) => {
        setData({...data, message: value});
    };

    const handleSubmit = async (data) => {
        setSubmitting(true);
        try {
            await firebase.rateLivestream(livestreamId, email, data, ratingId);
        } catch (e) {
        }
        closeSnackbar(ratingId);
        setSubmitting(false);
    };
    return (
        <Grid container>
            <Grid xl={12} lg={12} md={12} sm={12} xs={12} item>
                <Rating
                    name={question}
                    value={data.rating}
                    size="large"
                    max={5}
                    onChange={handleRatingChange}
                />
            </Grid>
            {hasText ? (
                <>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <TextField
                            multiline
                            fullWidth
                            margin="dense"
                            value={data.message}
                            inputProps={{maxLength: 1000}}
                            label="Reason (optional)"
                            onChange={handleMessageChange}
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
                    >
                        <Button
                            color="primary"
                            disabled={submitting || !data.rating}
                            onClick={() => handleSubmit(data)}
                            variant="contained"
                            className={classes.button}
                        >
                            Submit
                        </Button>
                    </Grid>
                </>
            ) : null}
        </Grid>
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
        }, 3 * 1000); // check for minutes passed every 10 seconds
        return () => clearInterval(interval);
    }, [livestream.start]);

    useEffect(() => {
        if (minutesPassed) {
            (async function () {
                await handleCheckRatings();
            })()
        }
    }, [minutesPassed, livestream.hasEnded]);

    const handleCheckRatings = async () => {
        for (const [index, rating] of ratings.entries()) {
            // this loop allows for easy async functions along with index
            if (
                !rating.hasRated &&
                minutesPassed > rating.appearAfter &&
                authenticatedUser?.email
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
                                    question={rating.question}
                                    hasText={rating.hasText}
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
