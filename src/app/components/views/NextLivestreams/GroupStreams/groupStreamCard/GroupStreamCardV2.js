import React, {Fragment, useEffect, useState} from 'react';
import {withFirebase} from "context/firebase";
import {fade, makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../../../util/constants";
import {Avatar, Button, Card, CardMedia, Paper} from "@material-ui/core";
import {AvatarGroup} from "@material-ui/lab";
import Streamers from "./Streamers";
import Wave from "./Wave";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import Typography from "@material-ui/core/Typography";
import LogoElement from "../LogoElement";
import QueryBuilderRoundedIcon from "@material-ui/icons/QueryBuilderRounded";
import DateUtil from "../../../../../util/DateUtil";
import TargetOptions from "../../GroupsCarousel/TargetOptions";
import {grey} from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => {
    const transition = `transform ${theme.transitions.duration.shorter}ms ${theme.transitions.easing.easeInOut}`
    const paperColor = theme.palette.background.paper
    return ({
        game: {
            display: "flex",
            justifyContent: "center",
            position: "relative",
            zIndex: ({cardHovered}) => cardHovered && 9999,
            "& p": {
                color: ({cardHovered}) => cardHovered ? theme.palette.common.white : theme.palette.common.black
            },
        },
        date: {
            color: ({cardHovered}) => cardHovered && theme.palette.common.white,
            position: 'absolute',
            top: '0',
            right: '1em',
            zIndex: '999',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            padding: '0.5em 0.5em 0.75em',
            WebkitTransition: transition,
            transition: transition,
            // transform: ({cardHovered}) => cardHovered && "translate(71%, -61%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        companyLogo: {
            maxWidth: "100%"
        },
        logoWrapper: {
            height: 230,
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(1),
            borderRadius: `${theme.spacing(2)}px 0px`,
            background: grey[50]
        },
        companyName: {
            fontWeight: "bold",
            margin: '0.75em 0',
            textAlign: 'center',
            // animation: ({cardHovered}) => cardHovered && "$gameName 250ms forwards",
            fontSize: theme.spacing(3),
            display: "flex",
            alignItems: "center",
            height: 60
        },
        front: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: ({cardHovered}) => cardHovered && "translateY(-30%) scale(0.7)",
            transition: '250ms',
            background: ({cardHovered}) => cardHovered ? "transparent" : fade(paperColor, 0.5),
            boxShadow: ({cardHovered}) => cardHovered && "none",
            borderRadius: theme.spacing(2.2)
        },
        speakersAndLogosWrapper: {
            opacity: ({cardHovered}) => cardHovered && 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        },
        speakerAndButtonsWrapper: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        },
        logosFrontWrapper: {
            padding: theme.spacing(1),
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            height: 100
        },
        detailsBtn: {
            borderRadius: theme.spacing(2),
        },
        background: {
            transition: ({cardHovered}) => cardHovered && `${transition}, opacity 100ms linear`,
            transform: ({
                            cardHovered,
                            mobile
                        }) => cardHovered ? mobile ? 'scale(1, 1.3)' : 'scale(1.35, 1.3) translateY(5%)' : 'scale(0.2, 0.9)',
            opacity: ({cardHovered}) => cardHovered ? 1 : 0,
            background: 'rgb(40, 46, 54)',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: "auto",
            zIndex: '-1',
            borderRadius: theme.spacing(2),
            overflow: 'hidden',
            boxShadow: theme.shadows[24]
        },
        backgroundContent: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: theme.spacing(2),
            marginTop: 140,
        },
        backgroundImage: {
            position: "absolute",
            opacity: '.3',
            clipPath: 'url(#wave)',
            height: '30%',
            width: '100%',
            objectFit: 'cover',
        },
        '@keyframes gameName': {
            '0%': {
                textAlign: 'left',
                opacity: '1'
            },
            '20%': {
                textAlign: 'left',
                opacity: '0'
            },
            '50%': {
                textAlign: 'center',
                opacity: '0',
                transform: 'scale(1.2)'
            },
            '100%': {
                textAlign: 'center',
                opacity: '1',
                transform: 'scale(1.2)'
            }
        }
    })
})


const GroupStreamCardV2 = ({
                               livestream,
                               user,
                               mobile,
                               fields,
                               userData,
                               firebase,
                               livestreamId,
                               id,
                               careerCenterId,
                               groupData,
                               listenToUpcoming,
                               hasCategories
                           }) => {

    const [careerCenters, setCareerCenters] = useState([])
    const [cardHovered, setCardHovered] = useState(false)
    const classes = useStyles({cardHovered, mobile, hasCategories, listenToUpcoming})
    const [targetOptions, setTargetOptions] = useState([])
    const [fetchingCareerCenters, setFetchingCareerCenters] = useState(false)

    useEffect(() => {
        if (groupData.categories && livestream.targetCategories) {
            const {groupId, categories} = groupData
            let totalOptions = []
            categories.forEach(category => totalOptions.push(category.options))
            const flattenedOptions = totalOptions.reduce(function (a, b) {
                return a.concat(b);
            }, []);
            const matchedOptions = livestream.targetCategories[groupId]
            if (matchedOptions) {
                const filteredOptions = flattenedOptions.filter(option => matchedOptions.includes(option.id))
                setTargetOptions(filteredOptions)
            }
        }
    }, [groupData, livestream])

    useEffect(() => {
        if (!careerCenters.length && livestream && livestream.groupIds && livestream.groupIds.length) {
            setFetchingCareerCenters(true)
            firebase.getDetailLivestreamCareerCenters(livestream.groupIds)
                .then((querySnapshot) => {
                    let groupList = [];
                    querySnapshot.forEach((doc) => {
                        let group = doc.data();
                        group.id = doc.id;
                        groupList.push(group);
                    });
                    setFetchingCareerCenters(false)
                    setCareerCenters(groupList);
                }).catch(() => setFetchingCareerCenters(false))
        }
    }, [livestream.id]);

    const handleMouseEntered = () => {
        setCardHovered(true)
    }

    const handleMouseLeft = () => {
        setCardHovered(true)
    }
    console.log("livestream", livestream);

    const checkIfUserFollows = (careerCenter) => {
        if (user && userData && userData.groupIds) {
            const {groupId} = careerCenter
            return userData.groupIds.includes(groupId)
        } else {
            return false
        }
    }

    let logoElements = careerCenters.map((careerCenter, index) => {
        return (
            <div style={{flex: 1, minWidth: "25%"}} key={careerCenter.groupId}>
                <LogoElement key={careerCenter.groupId} livestreamId={livestream.id}
                             userfollows={checkIfUserFollows(careerCenter)}
                             careerCenter={careerCenter} userData={userData} user={user}/>
            </div>
        );
    });

    let speakerElements = livestream.speakers?.map(speaker => {
        return (<Avatar
            key={speaker.id}
            src={speaker.avatar || speakerPlaceholder}
            alt={speaker.firstName}/>)
    })

    return (
        <Fragment>
            <div onMouseLeave={handleMouseLeft} onMouseEnter={handleMouseEntered} className={classes.game}>
                <div className={classes.date}>
                    <QueryBuilderRoundedIcon
                        style={{marginRight: "0.7rem"}}/>{DateUtil.getPrettyTime(livestream.start.toDate())}
                </div>
                <Paper elevation={4} className={classes.front}>
                    <Paper elevation={cardHovered ? 24 : 4} className={classes.logoWrapper}>
                        <img className={classes.companyLogo} src={livestream.companyLogoUrl} alt=""/>
                    </Paper>
                    <Typography className={classes.companyName}>
                        {livestream.company}
                    </Typography>
                    <div className={classes.speakersAndLogosWrapper}>
                        <AvatarGroup max={3}>
                            {speakerElements}
                        </AvatarGroup>
                        <div className={classes.logosFrontWrapper}>
                            {logoElements}
                        </div>
                    </div>
                </Paper>
                <div className={classes.background}>
                    <img className={classes.backgroundImage} src={livestream.backgroundImageUrl} alt="background"/>
                    <div className={classes.backgroundContent}>
                        <Button className={classes.detailsBtn} startIcon={<LibraryBooksIcon/>} size="large"
                                variant="contained" color="secondary">Details</Button>
                        <Streamers speakers={livestream.speakers} cardHovered={cardHovered}/>
                        <div style={{padding: "1rem", paddingTop: 0}}>
                            {!!targetOptions.length &&
                            <TargetOptions options={targetOptions}/>}
                        </div>
                    </div>
                </div>
            </div>
            <Wave/>
        </Fragment>
    )

}


export default withFirebase(GroupStreamCardV2);
