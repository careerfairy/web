import React, {useState, useEffect, useContext} from 'react';
import {withFirebasePage} from 'context/firebase';
import {Rating} from '@material-ui/lab';
import UserContext from 'context/user/UserContext';
import {useSnackbar} from "notistack";


const ActionComponent = ({snackKey, firebase, typeOfRating, livestreamId, email}) => {
    const {closeSnackbar} = useSnackbar();

    const handleChange = async (event, value) => {
        await firebase.rateLivestream(livestreamId, email, value, typeOfRating)
        closeSnackbar(snackKey)
    }
    return (
        <Rating
            name={snackKey}
            style={{marginRight: '20px'}}
            size="large"
            max={5}
            onChange={handleChange}/>
    )
}


const RatingContainer = ({firebase, livestream, livestreamId}) => {
    const {authenticatedUser} = useContext(UserContext);
    const {enqueueSnackbar} = useSnackbar();
    const [minutesPassed, setMinutesPassed] = useState(null)
    const [ratings, setRatings] = useState([
        {
            message: "How would you rate this live stream?",
            type: "overall",
            appearAfter: 1,
            hasRated: false
        },
        {
            message: `How happy are you with the content shared by ${livestream.company}?`,
            type: "company",
            appearAfter: 2,
            hasRated: false
        },
        {
            message: `After this stream, are you more likely to apply to ${livestream.company}?`,
            type: "willingnessToApply",
            appearAfter: 3,
            hasRated: false
        },
    ])
    console.log("-> minutesPassed", minutesPassed);

    useEffect(() => {
        var interval = setInterval(() => {
            setMinutesPassed(getMinutesPassed())
        }, 10 * 1000);// check for minutes passed every 10 seconds
        return () => clearInterval(interval)
    }, [livestream.start]);

    useEffect(() => {
        handleCheckRatings()
    }, [minutesPassed])

    const handleCheckRatings = async () => {
        for (const [index, rating] of ratings.entries()) { // this loop allows for easy async functions along with index
            if (!rating.hasRated && minutesPassed > rating.appearAfter) { // if you've already rated, dont bother making an api call
                const hasRated = await firebase.checkIfUserRated(livestreamId, authenticatedUser.email, rating.type)
                if (hasRated) {
                    const newRatings = [...ratings]
                    newRatings[index].hasRated = true // mark that particular rating as already rated
                    setRatings(newRatings) // set updated ratings with new has rated status
                } else {
                    enqueueSnackbar(rating.message, {
                        variant: "info",
                        persist: true,
                        preventDuplicate: true,
                        key: rating.message,
                        action: <ActionComponent snackKey={rating.message} firebase={firebase} email={authenticatedUser.email}
                                                 livestreamId={livestreamId}
                                                 typeOfRating={rating.type}/>,
                    })
                }
            }
        }

    }

    // const handleRatings = async () => {
    //     if (minutesPassed > 1) {
    //         const hasRatedOverall = await firebase.checkIfUserRated(livestreamId, authenticatedUser.email, "overall")
    //         if (!hasRatedOverall) {
    //             const message = "How would you rate this live stream?"
    //             enqueueSnackbar(message, {
    //                 variant: "default",
    //                 persist: true,
    //                 preventDuplicate: true,
    //                 key: message,
    //                 action: <ActionComponent snackKey={message} firebase={firebase} email={authenticatedUser.email}
    //                                          livestreamId={livestreamId}
    //                                          typeOfRating="overall"/>,
    //             })
    //         }
    //     }
    //     if (minutesPassed > 2) {
    //         const hasRatedCompany = await firebase.checkIfUserRated(livestreamId, authenticatedUser.email, "company")
    //         if (!hasRatedCompany) {
    //             const message = `How happy are you with the content shared by ${livestream.company}?`
    //             enqueueSnackbar(message, {
    //                 variant: "default",
    //                 persist: true,
    //                 key: message,
    //                 preventDuplicate: true,
    //                 action: <ActionComponent snackKey={message} firebase={firebase} email={authenticatedUser.email}
    //                                          livestreamId={livestreamId}
    //                                          typeOfRating="company"/>,
    //             })
    //         }
    //     }
    //     if (minutesPassed > 3) {
    //
    //         const hasRatedWillingness = await firebase.checkIfUserRated(livestreamId, authenticatedUser.email, "willingnessToApply")
    //         if (!hasRatedWillingness) {
    //             const message = `After this stream, are you more likely to apply to ${livestream.company}?`
    //             enqueueSnackbar(message, {
    //                 variant: "default",
    //                 persist: true,
    //                 preventDuplicate: true,
    //                 key: message,
    //                 action: <ActionComponent snackKey={message} firebase={firebase} email={authenticatedUser.email}
    //                                          livestreamId={livestreamId}
    //                                          typeOfRating="willingnessToApply"/>,
    //             })
    //         }
    //     }
    // }

    const getMinutesPassed = () => {
        const now = new Date()
        if (livestream?.start?.toDate()) {
            const diff = Math.abs(now - livestream.start.toDate());
            return Math.floor((diff / 1000) / 60)
        } else {
            return null
        }
    }


    return null
}

export default withFirebasePage(RatingContainer);