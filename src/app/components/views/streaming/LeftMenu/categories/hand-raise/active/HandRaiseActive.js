import React, {useState, useEffect, Fragment, useContext} from 'react';
import {withFirebase} from 'context/firebase';
import HandRaiseElement from './hand-raise-element/HandRaiseElement';
import NotificationsContext from 'context/notifications/NotificationsContext';
import Grow from "@material-ui/core/Grow";
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';

import {Box, Button, Typography, useTheme} from "@material-ui/core";
import {CategoryContainerCentered, CategoryContainerTopAligned} from "../../../../../../../materialUI/GlobalContainers";
import {GreyPermanentMarker, ThemedPermanentMarker} from "../../../../../../../materialUI/GlobalTitles";
import Paper from "@material-ui/core/Paper";

function HandRaiseActive(props) {

    const {setNewNotification, setNotificationToRemove} = useContext(NotificationsContext);


    const [handRaises, setHandRaises] = useState([]);

    useEffect(() => {
        if (props.livestream) {
            props.firebase.listenToHandRaises(props.livestream.id, querySnapshot => {
                var handRaiseList = [];
                querySnapshot.forEach(doc => {
                    let handRaise = doc.data();
                    handRaise.id = doc.id;
                    handRaiseList.push(handRaise);
                });
                setHandRaises(handRaiseList);
            });
        }
    }, [props.livestream]);

    function setHandRaiseModeInactive() {
        props.firebase.setHandRaiseMode(props.livestream.id, false);
    }

    function updateHandRaiseRequest(handRaiseId, state) {
        props.firebase.updateHandRaiseRequest(props.livestream.id, handRaiseId, state);
    }

    let handRaiseElements = handRaises.filter(handRaise => (handRaise.state !== 'unrequested' && handRaise.state !== 'denied')).map(handRaise => {
        return (
            <HandRaiseElement request={handRaise} updateHandRaiseRequest={updateHandRaiseRequest}
                              setNewNotification={setNewNotification}
                              setNotificationToRemove={setNotificationToRemove}/>
        );
    })

    if (!props.livestream.handRaiseActive) {
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
                        <Typography align="center">Your viewers can now request to join the stream. Don't forget to
                            remind them
                            to join in!</Typography>
                        <Button style={{marginTop: "1rem"}} variant="contained" startIcon={<CloseRoundedIcon/>}
                                children='Deactivate Hand Raise'
                                onClick={() => setHandRaiseModeInactive()}/>
                    </Box>
                </CategoryContainerCentered>
            </Grow>
        </>
    )
        ;
}

export default withFirebase(HandRaiseActive);