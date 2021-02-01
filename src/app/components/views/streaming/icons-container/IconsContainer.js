import {useState, useEffect, useContext, useMemo} from 'react';
var _ = require('lodash')
import RubberBand from 'react-reveal/RubberBand';
import {withFirebasePage} from 'context/firebase';
import React, {memo} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {v4 as uuidv4} from "uuid";
import TutorialContext from "../../../../context/tutorials/TutorialContext";
import ThumbUpAltOutlinedIcon from "@material-ui/icons/ThumbUpAltOutlined";
import FavoriteBorderOutlinedIcon from "@material-ui/icons/FavoriteBorderOutlined";
import ClappingSVG from "../../../util/CustomSVGs";
import {useSelector} from "react-redux";

const useStyles = makeStyles(theme => ({
    actionBtn: {
        borderRadius: "50%",
        backgroundColor: ({color}) => color,
        width: 50,
        height: 50,
        boxShadow: "0 0 8px rgb(120,120,120)",
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',

    },
    image: {
        color: "white",
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '25px',
        height: "25px",
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
}))


const ActionButton = React.memo(({iconName, color, getRandomDuration, getRandomHorizontalPosition, id}) => {
    const [distance, setDistance] = useState(0)
    const [opacity, setOpacity] = useState(1)

    useEffect(() => {
        setDistance(-100)
        setOpacity(0)
    }, [])

    const durationTransform = useMemo(() => getRandomDuration(3500, 4500), [id]);
    const right = useMemo(() => getRandomHorizontalPosition(90), [id]);
    const classes = useStyles({color, distance, right, durationTransform, opacity})

    const renderIcon = () => {
        if (iconName === "like") {
            return <ThumbUpAltOutlinedIcon className={classes.image} fontSize="default"/>
        } else if (iconName === "clapping") {
            return <ClappingSVG className={classes.image}/>
        } else {
            return <FavoriteBorderOutlinedIcon className={classes.image} fontSize="default"/>
        }
    }


    return (
        <div className={classes.animatedBox}>
            <RubberBand style={{position: "absolute"}}>
                <div className={classes.actionBtn}>
                    {renderIcon()}
                </div>
            </RubberBand>
        </div>
    )
})

const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const emotes = ["clapping", "like", "heart"]

function IconsContainer({livestreamId, firebase}) {
    const emotesData = useSelector(state => state.emotes.emotesData)
    console.log("-> emotesData in Icons container", emotesData);
    const [livestreamIcons, setLivestreamIcons] = useState([])
    const {tutorialSteps, setTutorialSteps, showBubbles, setShowBubbles} = useContext(TutorialContext);

    useEffect(() => {
        if (livestreamId && !showBubbles) {
            const unsubscribe = firebase.listenToLivestreamIcons(livestreamId, querySnapshot => {
                let icons = []
                querySnapshot.forEach((doc) => {
                    const icon = doc.data()
                    icon.id = doc.id
                    icons.push(icon)
                })
                setLivestreamIcons(prevState => {
                    if (prevState.length > 40) {
                        return prevState.slice(-20)
                    } else {
                        if (icons[0]) {
                            const filteredState = [...prevState, icons[0]]
                            return _.uniqBy(filteredState, 'id')

                        } else {
                            return prevState
                        }
                    }
                })
            });
            return () => unsubscribe()
        }
    }, [livestreamId, showBubbles]);


    useEffect(() => {
        if (showBubbles) {
            let count = 0
            const interval = setInterval(() => {
                count = count + 1
                if (count === 10) {
                    setShowBubbles(false)
                }
                simulateEmotes()
            }, 200);
            return () => clearInterval(interval)
        }
    }, [showBubbles])

    const simulateEmotes = () => {
        const index = randomInteger(1, 3)
        const newIcon = {
            id: uuidv4(),
            name: emotes[index - 1],
        }
        setLivestreamIcons(prevState => [...prevState, newIcon])
    }

    function getRandomHorizontalPosition(maxDistance) {
        return Math.random() * maxDistance;
    }

    function getRandomDuration(min, max) {
        return Math.random() * (max - min) + min //returns int between min and max
    }

    const getColor = (iconName) => {
        if (iconName === "clapping") {
            return "#f15946"
        } else if (iconName === "heart") {
            return "#f9c22e"
        } else {
            return "#e01a4f"
        }
    }

    let iconElements = livestreamIcons.map((iconEl) => {
        return (<ActionButton
                id={iconEl.id}
                key={iconEl.id}
                getRandomHorizontalPosition={getRandomHorizontalPosition}
                iconName={iconEl.name}
                getRandomDuration={getRandomDuration}
                color={getColor(iconEl.name)}/>
        );
    });

    return (
        <div style={{position: "relative"}} className='topLevelContainer'>
            {iconElements}
        </div>
    );
}

export default memo(withFirebasePage(IconsContainer));