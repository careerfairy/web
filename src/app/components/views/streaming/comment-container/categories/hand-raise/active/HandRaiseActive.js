import React, {useState, useEffect, Fragment, useContext} from 'react';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';
import { withFirebase } from 'context/firebase';
import HandRaiseElement from './hand-raise-element/HandRaiseElement';
import NotificationsContext from 'context/notifications/NotificationsContext';

function HandRaiseActive(props) {

    const { setNewNotification } = useContext(NotificationsContext);

    if (!props.livestream.handRaiseActive) {
        return null;
    }

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
    },[props.livestream]);

    function setHandRaiseModeInactive() {
        props.firebase.setHandRaiseMode(props.livestream.id, false);
    }

    function updateHandRaiseRequest(handRaiseId, state) {
        props.firebase.updateHandRaiseRequest(props.livestream.id, handRaiseId, state);
    }

    let handRaiseElements = handRaises.filter( handRaise => (handRaise.state !== 'unrequested' && handRaise.state !== 'denied')).map( handRaise => {
        return (
            <HandRaiseElement request={handRaise} updateHandRaiseRequest={updateHandRaiseRequest} setNewNotification={setNewNotification} />
        );
    })

    if (handRaiseElements.length > 0) {
        return(
            <div>
                <div className='handraise-container'>
                    { handRaiseElements }
                    <div className='bottom-container'>
                        <Button icon='delete' content='Deactivate Hand Raise' onClick={() => setHandRaiseModeInactive()}/>
                    </div>
                </div>  
                <style jsx>{`
                    .handraise-container {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgb(240,240,240);
                    }

                    .bottom-container {
                        position: absolute;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 100%;
                        text-align: center;
                    }
            `}</style>
            </div>
        );
    }
    return (
        <div>
            <div className='handraise-container'>
                { handRaiseElements }
                <div className='central-container'>
                    <div className='animated bounce infinite slow'>
                        <Icon name='hand point up outline' size='huge' style={{ color: 'rgba(0, 210, 170)'}}/>
                    </div>
                    <h2>Waiting for viewers to raise their hands...</h2>
                    <p>Your viewers can now request to join the stream. Don't forget to remind them to join in!</p>
                    <Button icon='delete' size='small' content='Deactivate Hand Raise' onClick={() => setHandRaiseModeInactive()}/>
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgb(240,240,240);
                }

                .central-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%,-50%);
                    text-align: center;
                    width: 80%;
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
        </div>
    );
}

export default withFirebase(HandRaiseActive);