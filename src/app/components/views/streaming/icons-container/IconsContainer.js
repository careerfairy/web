import React, {memo, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import * as actions from '../../../../store/actions'
import RubberBand from 'react-reveal/RubberBand';
import {makeStyles} from "@material-ui/core/styles";
import {v4 as uuidv4} from "uuid";
import TutorialContext from "../../../../context/tutorials/TutorialContext";
import ThumbUpAltOutlinedIcon from "@material-ui/icons/ThumbUpAltOutlined";
import FavoriteBorderOutlinedIcon from "@material-ui/icons/FavoriteBorderOutlined";
import ClappingSVG from "../../../util/CustomSVGs";
import {useDispatch, useSelector} from "react-redux";
import {TransitionGroup} from "react-transition-group";
import {EMOTE_MESSAGE_TEXT_TYPE} from "../../../util/constants";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    root: {},
    actionBtn: {
        borderRadius: "50%",
        backgroundColor: ({color}) => color,
        width: 50,
        height: 50,
        boxShadow: theme.shadows[10],
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

const START_DISTANCE = 0
const ActionButton = React.memo(({iconName, color, getRandomDuration, getRandomHorizontalPosition, id}) => {
    const [distance, setDistance] = useState(START_DISTANCE)
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
}, () => true)

const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const emotes = ["clapping", "like", "heart"]

function IconsContainer({className}) {
    const classes = useStyles()
    const emotesData = useSelector(state => state.emotes.emotesData)
    const {showBubbles, setShowBubbles} = useContext(TutorialContext);
    const dispatch = useDispatch()

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

    const simulateEmotes =  () => {
        const index = randomInteger(1, 3)
        const memberId = uuidv4()
        const message = {
            textType: EMOTE_MESSAGE_TEXT_TYPE,
            emoteType: emotes[index - 1],
            timestamp: new Date().getTime()
        }
        dispatch(actions.setEmote(message, memberId))
    }

    const getRandomHorizontalPosition = useCallback((maxDistance) => {
        return Math.random() * maxDistance;
    }, [])

    const getRandomDuration = useCallback((min, max) => {
        return Math.random() * (max - min) + min //returns int between min and max
    }, [])

    const getColor = useCallback((iconName) => {
        if (iconName === "clapping") {
            return "#f15946"
        } else if (iconName === "heart") {
            return "#f9c22e"
        } else {
            return "#e01a4f"
        }
    }, [])

    return (
        <div className={clsx(classes.root, className)}>
            {emotesData.length > 0 && (
                <TransitionGroup>
                    {emotesData.map((iconEl) => (
                        <ActionButton
                            id={iconEl.timestamp}
                            key={iconEl.timestamp}
                            getRandomHorizontalPosition={getRandomHorizontalPosition}
                            iconName={iconEl.emoteType}
                            getRandomDuration={getRandomDuration}
                            color={getColor(iconEl.emoteType)}/>
                    ))}
                </TransitionGroup>
            )}
        </div>
    );
}

export default memo(IconsContainer);