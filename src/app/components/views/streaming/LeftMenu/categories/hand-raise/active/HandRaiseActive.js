import React, {useContext, useEffect, useState} from 'react';
import {withFirebase} from 'context/firebase';
import HandRaiseElement from './hand-raise-element/HandRaiseElement';
import NotificationsContext from 'context/notifications/NotificationsContext';
import Grow from "@material-ui/core/Grow";
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';

import {Box, Button, Typography} from "@material-ui/core";
import {CategoryContainerCentered, CategoryContainerTopAligned} from "../../../../../../../materialUI/GlobalContainers";
import {ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";
import Paper from "@material-ui/core/Paper";
import TutorialContext from "../../../../../../../context/tutorials/TutorialContext";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "../../../../../../../materialUI/GlobalTooltips";

function HandRaiseActive({firebase, livestream, showMenu, selectedState, sliding}) {

    const {setNewNotification, setNotificationToRemove} = useContext(NotificationsContext);
    const {tutorialSteps, setTutorialSteps} = useContext(TutorialContext);

    useEffect(() => {
        if (livestream) {
            firebase.listenToHandRaises(livestream.id, querySnapshot => {
                var handRaiseList = [];
                querySnapshot.forEach(doc => {
                    let handRaise = doc.data();
                    handRaise.id = doc.id;
                    handRaiseList.push(handRaise);
                });
                setHandRaises(handRaiseList);
            });
        }
    }, [livestream]);

    const getActiveTutorialStepKey = () => {
        return Object.keys(tutorialSteps).find((key) => {
            if (tutorialSteps[key]) {
                return key
            }
        })
    }

    const isOpen = (property) => {
        const activeStep = Number(getActiveTutorialStepKey())
        return Boolean(livestream.test
            && showMenu
            && tutorialSteps.streamerReady
            && (tutorialSteps[property] || property < activeStep)
            && selectedState === "hand"
            && !sliding
        )
    }

    const handleConfirm = (property) => {
        setTutorialSteps({
            ...tutorialSteps,
            [property]: false,
            [property + 1]: true,
        })
    }

    const [handRaises, setHandRaises] = useState([]);


    function setHandRaiseModeInactive() {
        firebase.setHandRaiseMode(livestream.id, false);
    }

    function updateHandRaiseRequest(handRaiseId, state) {
        firebase.updateHandRaiseRequest(livestream.id, handRaiseId, state);
    }

    let handRaiseElements = handRaises.filter(handRaise => (handRaise.state !== 'unrequested' && handRaise.state !== 'denied')).map(handRaise => {
        return (
            <HandRaiseElement request={handRaise} updateHandRaiseRequest={updateHandRaiseRequest}
                              setNewNotification={setNewNotification}
                              setNotificationToRemove={setNotificationToRemove}/>
        );
    })

    if (!livestream.handRaiseActive) {
        return null;
    }
    return (<>
            <Grow mountOnEnter unmountOnExit in={Boolean(handRaiseElements.length)}>
                <CategoryContainerTopAligned style={{background: "rgb(240,240,240)"}}>
                    {handRaiseElements}
                    <Button style={{margin: "auto 0 2rem 0"}} startIcon={<CloseRoundedIcon/>} variant="contained"
                            children='Deactivate Hand Raise'
                            onClick={() => setHandRaiseModeInactive()}/>
                </CategoryContainerTopAligned>
            </Grow>

            <Grow mountOnEnter unmountOnExit in={Boolean(!handRaiseElements.length)}>
                <CategoryContainerCentered>
                    <Box p={2} component={Paper} style={{width: "90%", display: "grid", placeItems: "center"}}>
                        <PanToolOutlinedIcon color="primary" style={{fontSize: 40}}/>
                        <ThemedPermanentMarker gutterBottom>Waiting for viewers to raise their
                            hands...</ThemedPermanentMarker>
                        <Typography style={{marginBottom: "1rem"}} align="center">Your viewers can now request to join
                            the stream. Don't forget to
                            remind them
                            to join in!</Typography>
                        <WhiteTooltip
                            placement="right-start"
                            title={
                                <React.Fragment>
                                    <TooltipTitle>Hand Raise (2/2)</TooltipTitle>
                                    <TooltipText>
                                        Once you are have finished your interaction with the speaker
                                        you can now de-activate the Hand Raise mode to prevent viewers
                                        from making subsequent requests.
                                    </TooltipText>
                                    <TooltipButtonComponent onConfirm={() => {
                                        setHandRaiseModeInactive()
                                        handleConfirm(10)
                                    }} buttonText="Ok"/>
                                </React.Fragment>
                            } open={isOpen(10)}>
                            <Button variant="contained" startIcon={<CloseRoundedIcon/>}
                                    children='Deactivate Hand Raise'
                                    onClick={() => {
                                        setHandRaiseModeInactive()
                                        isOpen(10) && handleConfirm()
                                    }}/>
                        </WhiteTooltip>
                    </Box>
                </CategoryContainerCentered>
            </Grow>
        </>
    )
        ;
}

export default withFirebase(HandRaiseActive);