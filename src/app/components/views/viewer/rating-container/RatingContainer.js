import React, {useState, useEffect, useContext, Fragment} from 'react';

import {withFirebasePage} from 'context/firebase';
import {IconButton} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import {Rating} from '@material-ui/lab';
import UserContext from 'context/user/UserContext';
import {useSnackbar} from "notistack";

function RatingComponent({rating, livestreamId}) {
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const {authenticatedUser, userData} = useContext(UserContext);

    useEffect(() => {
        enqueueSnackbar(rating.text, {
            variant: "default",
            persist: true,
            action
        })
    }, [])

    const action = key => (
        <>
            <Rating
                name="customized-icons"
                style={{marginRight: '20px'}}
                onChange={(event, value) => {
                    rating.onRating(livestreamId, authenticatedUser, value);
                }}
                size="large"
                max={5}
            />
            <IconButton size="small" aria-label="close" color="inherit" onClick={() => closeSnackbar(key)}>
                <CloseIcon fontSize="small"/>
            </IconButton>
        </>
    );
}

const ActionComponent = (key, livestreamId, userEmail, firebase, typeOfRating) => {
    console.log("-> key", key);
    const {closeSnackbar} = useSnackbar();

    return (
        <>
            <Rating
                name="customized-icons"
                style={{marginRight: '20px'}}
                size="large"
                max={5}
                onChange={(event, value) => {
                    firebase.rateLivestream(livestreamId, userEmail, value, typeOfRating)
                }}/>
            <IconButton size="small" aria-label="close" color="inherit" onClick={() => closeSnackbar(key)}>
                <CloseIcon fontSize="small"/>
            </IconButton>
        </>
    )
};

const RatingContainer = ({firebase, livestream, livestreamId}) => {
    const {authenticatedUser} = useContext(UserContext);
    const {enqueueSnackbar} = useSnackbar();
    const [minutesPassed, setMinutesPassed] = useState(null)
    console.log("-> minutesPassed", minutesPassed);

    useEffect(() => {
        var interval = setInterval(() => {
            setMinutesPassed(getMinutesPassed())
        }, 10 * 1000);// check for minutes passed every 10 seconds
        return () => clearInterval(interval)
    }, [livestream.start]);

    useEffect(() => {
        handleRatings()
    }, [minutesPassed])

    const handleRatings = async () => {
        if (minutesPassed > 1) {
            const hasRatedOverall = await firebase.checkIfUserRated(livestreamId, authenticatedUser.email, "overall")
            if (!hasRatedOverall) {
                enqueueSnackbar("How would you rate this live stream?", {
                    variant: "default",
                    persist: true,
                    action: (snackbarKey) => <ActionComponent
                        firebase={firebase}
                        key={snackbarKey}
                        typeOfRating={"overall"}
                        livestreamId={livestreamId}
                        userEmail={authenticatedUser.email}
                    />
                })
            }
        }
        if (minutesPassed > 2) {
            const hasRatedCompany = await firebase.checkIfUserRated(livestreamId, authenticatedUser.email, "company")
            if (!hasRatedCompany) {
                enqueueSnackbar(`How happy are you with the content shared by ${livestream.company}?`, {
                    variant: "default",
                    persist: true,
                    action: (snackbarKey) => <ActionComponent
                        firebase={firebase}
                        key={snackbarKey}
                        typeOfRating={"company"}
                        livestreamId={livestreamId}
                        userEmail={authenticatedUser.email}
                    />
                })
            }
        }
        if (minutesPassed > 3) {
            const hasRatedWillingness = await firebase.checkIfUserRated(livestreamId, authenticatedUser.email, "willingnessToApply")
            if (!hasRatedWillingness) {
                enqueueSnackbar(`After this stream, are you more likely to apply to ${livestream.company}?`, {
                    variant: "default",
                    persist: true,
                    action: (snackbarKey) => <ActionComponent
                        firebase={firebase}
                        key={snackbarKey}
                        typeOfRating={"willingnessToApply"}
                        livestreamId={livestreamId}
                        userEmail={authenticatedUser.email}
                    />
                })
            }
        }
    }

    const getMinutesPassed = () => {
        const now = new Date()
        if (livestream?.start?.toDate()) {
            const diff = Math.abs(now - livestream.start.toDate());
            return Math.floor((diff / 1000) / 60)
        } else {
            return null
        }
    }

    return (
        <Fragment>
        </Fragment>
    );
}

export default withFirebasePage(RatingContainer);