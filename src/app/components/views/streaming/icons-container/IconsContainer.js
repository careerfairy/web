import {useState, useEffect} from 'react';
import {Image} from "semantic-ui-react";
import RubberBand from 'react-reveal/RubberBand';
import {withFirebasePage} from 'context/firebase';
import React, {memo} from "react";
import {makeStyles} from "@material-ui/core/styles";
import Fade from 'react-reveal/Fade';

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
}))

const ActionButton = ({icon, right, color, durationTransform}) => {

    const [distance, setDistance] = useState(0)
    const [opacity, setOpacity] = useState(1)
    useEffect(() => {
        setDistance(-100)
        setOpacity(0)
    }, [])
    const classes = useStyles({color, distance, right, durationTransform, opacity})

    return (
        <div className={classes.animatedBox}>
            <RubberBand>
                <div className={classes.actionBtn}>
                    <Image className={classes.image} src={'/' + icon.iconName + '.png'}/>
                </div>
            </RubberBand>
        </div>
    )
}

function IconsContainer({livestreamId, firebase}) {
    const [postedIcons, setPostedIcons] = useState([]);
    const [filteredIcons, setFilteredIcons] = useState([]);

    useEffect(() => {
        if (livestreamId) {
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
    }, [livestreamId]);

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
                durationTransform={getRandomDuration(3500, 4200)}
                color={getIconColor(icon)}/>
        );
    });

    return (
        <div className='topLevelContainer'>
            {postedIconsElements}
        </div>
    );
}

export default memo(withFirebasePage(IconsContainer));