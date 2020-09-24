import React, {useState, useEffect, Fragment, useContext} from 'react';
import { Input, Icon, Button, Modal } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';

function RequestedHandRaiseElement(props) {

    const [notificationId, setNotificationId] = useState(uuidv4());

    useEffect(() => {
        props.setNewNotification({
            id: notificationId,
            message: props.request.name + ' has haised a hand and requested to join the stream',
            confirmMessage: 'Invite',
            confirm: ()  =>  props.updateHandRaiseRequest(props.request.id, 'invited'),
            cancelMessage: 'Deny',
            cancel: () =>  props.updateHandRaiseRequest(props.request.id, 'denied'),
        });
    },[]);

    function updateHandRaiseRequest(state) {
        props.updateHandRaiseRequest(props.request.id, state);
        props.setNotificationToRemove(notificationId);
    }

    return (
        <div>
            <div className='handraise-container'>
                <div className='label'>HAND RAISED</div>
                <div className='name'>{ props.request.name }</div>
                <div className='button-group'>
                    <Button content='Invite to speak' size='mini' onClick={() => updateHandRaiseRequest('invited')} primary/>
                    <Button content='Deny' size='mini'  onClick={() => updateHandRaiseRequest('denied')}/>
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    padding: 20px 20px 30px 20px;
                    box-shadow: 0 0 2px grey;
                    width: 100%;
                }

                .label {
                    font-size: 0.9em;
                    font-weight: 700;
                }

                .name {
                    margin: 10px 0;
                }

                .button-group {
                    margin: 10px 0 0 0;
                }
          `}</style>
        </div>
    )
}

function InvitedHandRaiseElement(props) {
    return (
        <div>
            <div className='handraise-container'>
                <div className='label'>INVITED</div>
                <div className='name'>{ props.request.name }</div>
                <div className='button-group'>
                    <Button content='Remove' size='mini'  onClick={() => props.updateHandRaiseRequest(props.request.id, 'denied')}/>
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    padding: 20px 20px 30px 20px;
                    width: 100%;
                    background-color: rgb(0,210,170);
                    color: white;
                }

                .label {
                    font-size: 0.9em;
                    font-weight: 700;
                }

                .name {
                    margin: 10px 0;
                }

                .button-group {
                    margin: 10px 0 0 0;
                }
          `}</style>
        </div>
    )
}

function ConnectingHandRaiseElement(props) {

    const [notificationId, setNotificationId] = useState(uuidv4());

    useEffect(() => {
        props.setNewNotification({
            id: notificationId,
            message: props.request.name + ' is now connecting to the stream',
            confirmMessage: 'OK',
            confirm: ()  =>  {},
            cancelMessage: 'Stop Connection',
            cancel: () =>  props.updateHandRaiseRequest(props.request.id, 'denied'),
        });
    },[])

    function updateHandRaiseRequest(state) {
        props.updateHandRaiseRequest(props.request.id, state);
        props.setNotificationToRemove(notificationId);
    }

    return (
        <div>
            <div className='handraise-container'>
                <div className='label'>CONNECTING</div>
                <div className='name'>{ props.request.name }</div>
                <div className='button-group'>
                    <Button content='Remove' size='mini'  onClick={() => updateHandRaiseRequest('denied')}/>
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    padding: 20px 20px 30px 20px;
                    width: 100%;
                    background-color: rgb(0,210,170);
                    color: white;
                }

                .label {
                    font-size: 0.9em;
                    font-weight: 700;
                }

                .name {
                    margin: 10px 0;
                }

                .button-group {
                    margin: 10px 0 0 0;
                }
          `}</style>
        </div>
    )
}

function ConnectedHandRaiseElement(props) {

    const [notificationId, setNotificationId] = useState(uuidv4());

    useEffect(() => {
        props.setNewNotification({
            id: notificationId,
            message: props.request.name + ' is now connected to the stream',
            confirmMessage: 'OK',
            confirm: ()  =>  {},
            cancelMessage: 'Remove from Stream',
            cancel: () =>  props.updateHandRaiseRequest(props.request.id, 'denied'),
        });
    },[])

    function updateHandRaiseRequest(state) {
        props.updateHandRaiseRequest(props.request.id, state);
        props.setNotificationToRemove(notificationId);
    }

    return (
        <div>
            <div className='handraise-container'>
                <div className='label'>CONNECTED</div>
                <div className='name'>{ props.request.name }</div>
                <div className='button-group'>
                    <Button content='Remove' size='mini'  onClick={() => updateHandRaiseRequest('denied')}/>
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    padding: 20px 20px 30px 20px;
                    width: 100%;
                    background-color: rgb(0,210,170);
                    color: white;
                }

                .label {
                    font-size: 0.9em;
                    font-weight: 700;
                }

                .name {
                    margin: 10px 0;
                }

                .button-group {
                    margin: 10px 0 0 0;
                }
          `}</style>
        </div>
    )
}

function HandRaiseElement(props) {
    if (props.request.state === 'requested') {
        return <RequestedHandRaiseElement {...props} />
    }
    if (props.request.state === 'invited') {
        return <InvitedHandRaiseElement {...props} />
    }
    if (props.request.state === 'connecting') {
        return <ConnectingHandRaiseElement {...props} />
    }
    if (props.request.state === 'connected') {
        return <ConnectedHandRaiseElement {...props} />
    }
}

export default HandRaiseElement;