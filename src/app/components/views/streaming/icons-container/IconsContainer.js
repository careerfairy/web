import {useState, useEffect, useContext, useMemo} from 'react';
import {Image} from "semantic-ui-react";
import RubberBand from 'react-reveal/RubberBand';
import {withFirebasePage} from 'context/firebase';
import React, {memo} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {v4 as uuidv4} from "uuid";
import TutorialContext from "../../../../context/tutorials/TutorialContext";

const useStyles = makeStyles(theme => ({
    actionBtn: {
        borderRadius: "50%",
        backgroundColor: ({color}) => color,
        width: 50,
        height: 50,
        cursor: "pointer",
        boxShadow: "0 0 8px rgb(120,120,120)",
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',

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
}))


const ActionButton = React.memo(({iconName, color, getRandomDuration, getRandomHorizontalPosition, index}) => {
    const [shouldRender, setShouldRender] = useState(true)
    const [distance, setDistance] = useState(0)
    const [opacity, setOpacity] = useState(1)


    useEffect(() => {
        setDistance(-100)
        setOpacity(0)
    }, [])

    const durationTransform = useMemo(() => getRandomDuration(3500, 4500), [index]);
    const right = useMemo(() => getRandomHorizontalPosition(90), [index]);

    const classes = useStyles({color, distance, right, durationTransform, opacity})
    //
    // useEffect(() => {
    //     setTimeout(() => {
    //         setShouldRender(false)
    //     }, durationTransform);
    // }, [])


    return shouldRender && (
        <div className={classes.animatedBox}>
            <RubberBand>
                <div className={classes.actionBtn}>
                    <Image className={classes.image} src={'/' + iconName + '.png'}/>
                </div>
            </RubberBand>
        </div>
    )
})

const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const emotes = ["clapping", "like", "heart"]

function IconsContainer({livestreamId, firebase, isTest}) {

    const [likes, setLikes] = useState([]);
    console.log("-> likes", likes);
    const [hearts, setHearts] = useState([]);
    const [claps, setClaps] = useState([]);

    const [postedIcons, setPostedIcons] = useState([]);
    const {tutorialSteps, setTutorialSteps, showBubbles, setShowBubbles} = useContext(TutorialContext);

    useEffect(() => {
        if (livestreamId && !showBubbles) {
            const unsubscribeLikes = firebase.listenToLivestreamIconCollection(livestreamId, "like", querySnapshot => {
                let icons = []
                querySnapshot.forEach((doc) => {
                    icons.push(doc.data())
                })
                setLikes(prevState => {
                    if (prevState.length > 40) {
                        return prevState.slice(-20)
                    } else {
                        return [...prevState, icons[0]]
                    }
                })
            });

            const unsubscribeHearts = firebase.listenToLivestreamIconCollection(livestreamId, "heart", querySnapshot => {
                let icons = []
                querySnapshot.forEach((doc) => {
                    icons.push(doc.data())
                })
                setHearts(prevState => {
                    if (prevState.length > 40) {
                        return prevState.slice(-20)
                    } else {
                        return [...prevState, icons[0]]
                    }
                })
            });

            const unsubscribeClaps = firebase.listenToLivestreamIconCollection(livestreamId, "clapping", querySnapshot => {
                let icons = []
                querySnapshot.forEach((doc) => {
                    icons.push(doc.data())
                })
                setClaps(prevState => {
                    if (prevState.length > 40) {
                        return prevState.slice(-20)
                    } else {
                        return [...prevState, icons[0]]
                    }
                })
            });
            return () => [unsubscribeLikes, unsubscribeHearts, unsubscribeClaps].forEach(listener => listener())
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
        const newPostedIcons = [...postedIcons]
        const index = randomInteger(1, 3)
        newPostedIcons.push({
            id: uuidv4(),
            iconName: emotes[index - 1],
            randomPosition: Math.random()
        })
        setPostedIcons(newPostedIcons)
    }

    const handleToggle = () => {
        resetIcons()
        setShowBubbles(!showBubbles)
    }

    const resetIcons = () => {
        const newPostedIcons = [...postedIcons]
        setPostedIcons(newPostedIcons)
    }

    function getRandomHorizontalPosition(maxDistance) {
        return Math.random() * maxDistance;
    }

    function getRandomDuration(min, max) {
        return Math.random() * (max - min) + min //returns int between min and max
    }

    // let postedIconsElements = filteredIcons.map((icon, index) => {
    //     return (<ActionButton
    //             key={icon.id}
    //             index={index}
    //             right={getRandomHorizontalPosition(icon, 90)}
    //             icon={icon}
    //             durationTransform={getRandomDuration(3500, 4500)}
    //             color={getIconColor(icon)}/>
    //     );
    // });

    let likeElements = likes.map((iconEl, index) => {
        return (<ActionButton
                id={iconEl.id}
                key={iconEl.id}
                index={index}
                getRandomHorizontalPosition={getRandomHorizontalPosition}
                iconName="like"
                getRandomDuration={getRandomDuration}
                color={"#e01a4f"}/>
        );
    });

    let heartElements = hearts.map((iconEl, index) => {
        return (<ActionButton
                id={iconEl.id}
                key={iconEl.id}
                index={index}
                getRandomHorizontalPosition={getRandomHorizontalPosition}
                iconName="heart"
                getRandomDuration={getRandomDuration}
                color={"#f9c22e"}/>
        );
    });

    let clapElements = claps.map((iconEl, index) => {

        return (<ActionButton
                id={iconEl.id}
                key={iconEl.id}
                index={index}
                getRandomHorizontalPosition={getRandomHorizontalPosition}
                iconName="clapping"
                getRandomDuration={getRandomDuration}
                color={"#f15946"}/>
        );
    });

    return (
        <div style={{position: "relative"}} className='topLevelContainer'>
            {likeElements}
            {heartElements}
            {clapElements}
        </div>
    );
}

export default memo(withFirebasePage(IconsContainer));