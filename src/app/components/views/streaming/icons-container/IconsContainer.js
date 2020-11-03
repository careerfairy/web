import {useState, useEffect} from 'react';
import {Image} from "semantic-ui-react";
import RubberBand from 'react-reveal/RubberBand';
import {withFirebasePage} from 'context/firebase';
import React, {memo} from "react";
import {makeStyles} from "@material-ui/core/styles";
import Fade from 'react-reveal/Fade';
import {v4 as uuidv4} from "uuid";
import Tooltip from "@material-ui/core/Tooltip";
import {Fab} from "@material-ui/core";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";

const useStyles = makeStyles(theme => ({
    actionBtn: {
        borderRadius: "50%",
        backgroundColor: ({color}) => color,
        width: 50,
        height: 50,
        cursor: "pointer",
        boxShadow: "0 0 8px rgb(120,120,120)",
        bottom: 0,
    },
    image: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '25px'
    },
    animatedBox: {
        transition: ({durationTransform}) => `transform ${durationTransform}ms ease-in, opacity ${durationTransform}ms cubic-bezier(1,0,.83,.67)`,
        position: "absolute",
        opacity: ({opacity}) => opacity,
        right: ({right}) => right,
        transform: ({distance}) => `translateY(${distance}vh)`,
        "-moz-transform": ({distance}) => `translateY(${distance}vh)`,
        "-o-transform": ({distance}) => `translateY(${distance}vh)`,
        "-webkit-transform": ({distance}) => `translateY(${distance}vh)`,
    },
    demoFab: {
        position: "absolute",
        bottom: 3,
        right: 3,
        background: ({demoMode}) => demoMode ? "white" : theme.palette.secondary.main,
        "&:hover": {
            background: ({demoMode}) => demoMode ? "white" : theme.palette.secondary.dark,
        }
    },
    demoIcon: {
        color: ({demoMode}) => demoMode ? theme.palette.secondary.main : "white"
    }
}))

const ActionButton = ({icon, right, color, durationBubble, durationTransform}) => {

    const [distance, setDistance] = useState(0)
    const [opacity, setOpacity] = useState(1)
    useEffect(() => {
        setDistance(-100)
        setOpacity(0)
    }, [])
    const classes = useStyles({color, distance, right, durationTransform, opacity})

    return (
        <div className={classes.animatedBox}>
            <Fade duration={durationTransform / 3}>
                <RubberBand duration={durationBubble}>
                    <div className={classes.actionBtn}>
                        <Image className={classes.image} src={'/' + icon.iconName + '.png'}/>
                    </div>
                </RubberBand>
            </Fade>
        </div>
    )
}

const icon = {
    id: uuidv4(),
    iconName: "clap",
    randomPosition: 23
}

const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const emotes = ["clapping", "like", "heart"]

function IconsContainer({livestreamId, firebase, isTest}) {
    const [postedIcons, setPostedIcons] = useState([]);
    const [filteredIcons, setFilteredIcons] = useState([]);
    console.log("-> filteredIcons", filteredIcons);
    const [demoMode, setDemoMode] = useState(false)
    const [numberOfTimes, setNumberOfTimes] = useState(0)
    const classes = useStyles({demoMode})

    useEffect(() => {
        if (livestreamId && !demoMode) {
            const unsubscribe = firebase.listenToLivestreamIcons(livestreamId, querySnapshot => {
                let iconsList = [];
                querySnapshot.forEach(doc => {
                    let icon = doc.data();
                    icon.id = doc.id;
                    iconsList.push(icon);
                });
                setPostedIcons(iconsList);
            });

            return () => unsubscribe()
        }
    }, [livestreamId, demoMode]);

    useEffect(() => {
        if (postedIcons.length) {
            if (filteredIcons.length < 250) {
                if (!filteredIcons.some(icon => icon.id === postedIcons[postedIcons.length - 1].id)) {
                    setFilteredIcons([...filteredIcons, postedIcons[postedIcons.length - 1]]);
                }
            } else {
                if (!filteredIcons.some(icon => icon.id === postedIcons[postedIcons.length - 1].id)) {
                    setFilteredIcons([...filteredIcons.slice(filteredIcons.length - 150), postedIcons[postedIcons.length - 1]]);
                }
            }
        }
    }, [postedIcons]);

    useEffect(() => {
        if (numberOfTimes >= 100) {
            setDemoMode(false)
        }
    }, [numberOfTimes])

    useEffect(() => {
        if (demoMode) {
            const interval = setInterval(() => {
                simulateEmotes()
            }, 200);
            return () => clearInterval(interval)
        }
    }, [demoMode])

    function getIconColor(icon) {
        if (icon.iconName === 'like') {
            return '#e01a4f'
        }
        if (icon.iconName === 'clapping') {
            return '#f15946'
        }
        if (icon.iconName === 'heart') {
            return '#f9c22e'
        }
    }

    const simulateEmotes = () => {
        const newPostedIcons = [...postedIcons]
        const index = randomInteger(1, 3)
        newPostedIcons.push({
            id: uuidv4(),
            iconName: emotes[index - 1],
            randomPosition: Math.random()
        })
        setNumberOfTimes(count => count + 1)
        setPostedIcons(newPostedIcons)
    }

    const handleToggle = () => {
        resetIcons()
        setNumberOfTimes(0)
        setDemoMode(!demoMode)
    }

    const resetIcons = () => {
        const newPostedIcons = [...postedIcons]
        setPostedIcons(newPostedIcons)
    }

    function getRandomHorizontalPosition(icon, maxDistance) {
        return icon.randomPosition * maxDistance;
    }

    function getRandomDuration(min, max) {
        return Math.random() * (max - min) + min //returns int between min and max
    }

    let postedIconsElements = filteredIcons.map((icon, index) => {
        return (<ActionButton
                key={icon.id}
                right={getRandomHorizontalPosition(icon, 90)} icon={icon}
                durationBubble={getRandomDuration(500, 2000)}
                durationTransform={getRandomDuration(2000, 3000)}
                color={getIconColor(icon)}/>
        );
    });

    const DemoPollsButton = isTest ? (
        <Tooltip title="Demo Emotes">
            <Fab className={classes.demoFab} onClick={handleToggle} color="secondary" size="small">
                <AllInclusiveIcon className={classes.demoIcon}/>
            </Fab>
        </Tooltip>
    ) : null

    return (
        <div style={{position: "relative"}} className='topLevelContainer'>
            {DemoPollsButton}
            {postedIconsElements}
        </div>
    );
}

export default memo(withFirebasePage(IconsContainer));