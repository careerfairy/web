import React, {useState, useEffect, Fragment, useContext} from 'react';
import {withFirebase} from 'context/firebase';
import HandRaiseElement from './hand-raise-element/HandRaiseElement';
import NotificationsContext from 'context/notifications/NotificationsContext';
import Grow from "@material-ui/core/Grow";
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';

import {Button} from "@material-ui/core";

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
    return (
        <>
            <Grow unmountOnExit in={Boolean(handRaiseElements.length)}>
                <div className='handraise-container'>
                    {handRaiseElements}
                    <div className='bottom-container'>
                        <Button startIcon={<CloseRoundedIcon/>} variant="contained" children='Deactivate Hand Raise'
                                onClick={() => setHandRaiseModeInactive()}/>
                    </div>
                </div>
            </Grow>
            <style jsx>{`
                .handraise-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    background-color: rgb(240,240,240);
                }

                    .bottom-container {
                        width: 100%;
                        margin-top: auto;
                        text-align: center;
                        margin-bottom: 2rem;
                    }
            `}</style>

            <Grow unmountOnExit in={Boolean(!handRaiseElements.length)}>
                <div className='handraise-container'>
                    {handRaiseElements}
                    <div className='central-container'>
                        <div className='animated bounce infinite slow'>
                            <PanToolOutlinedIcon color="primary" fontSize="large"/>
                        </div>
                        <h2>Waiting for viewers to raise their hands...</h2>
                        <p>Your viewers can now request to join the stream. Don't forget to remind them to join in!</p>
                        <Button variant="contained" startIcon={<CloseRoundedIcon/>} children='Deactivate Hand Raise'
                                onClick={() => setHandRaiseModeInactive()}/>
                    </div>
                </div>
            </Grow>
            <style jsx>{`
                .handraise-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    //background-color: rgb(240,240,240);
                }

                .central-container {
                    text-align: center;
                    width: 90%;
                    color: rgb(40,40,40);
                }

                .central-container h2 {
                    font-family: 'Permanent Marker';
                    font-size: 2em;
                    color: rgb(0, 210, 170);
                }

                .central-container p {
                    margin: 20px 0 30px 0;
                }
          `}</style>

        </>
    );
}

export default withFirebase(HandRaiseActive);