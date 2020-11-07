import React, {useState, useEffect, Fragment, useContext} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {Button} from "@material-ui/core";
import TutorialContext from "context/tutorials/TutorialContext";
import {
    TooltipButtonComponent,
    TooltipText,
    TooltipTitle,
    WhiteTooltip
} from "materialUI/GlobalTooltips";

function RequestedHandRaiseElement(props) {

    const [notificationId, setNotificationId] = useState(uuidv4());
    const {tutorialSteps, setTutorialSteps, getActiveTutorialStepKey, handleConfirmStep, isOpen} = useContext(TutorialContext);

    const activeStep = getActiveTutorialStepKey()

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
        <>
            <WhiteTooltip
                placement="right-start"
                title={
                    <React.Fragment>
                        <TooltipTitle>Hand Raise (2/5)</TooltipTitle>
                        <TooltipText>
                            All the viewers who request to join your stream appear here. You can invite them in by clicking on the corresponding button.
                        </TooltipText>
                        {activeStep === 10 && < TooltipButtonComponent onConfirm={() => {
                            handleConfirmStep(10)
                            updateHandRaiseRequest('connected')
                        }} buttonText="Ok"/>}
                    </React.Fragment>
                } open={Boolean(props.hasEntered && isOpen(10))}>
                <div className='handraise-container'>
                    <div className='label'>HAND RAISED</div>
                    <div className='name'>{ props.request.name }</div>
                    <div className='button-group'>
                        <Button variant="contained" style={{marginRight: "1rem"}}  children='Invite to speak' size='small' onClick={() => {
                            if (isOpen(10)) {
                                handleConfirmStep(10)
                                updateHandRaiseRequest('connected')
                            } else {
                                updateHandRaiseRequest('invited')
                            }
                        }} color="primary"/>
                        <Button variant="contained" children='Deny' size='small' disabled={isOpen(10)} onClick={() => updateHandRaiseRequest('denied')}/>
                    </div>
                </div>  
            </WhiteTooltip>
            <style jsx>{`
                .handraise-container {
                    padding: 20px 20px 30px 20px;
                    box-shadow: 0 0 2px grey;
                    width: 270px;
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
        </>
    )
}

function InvitedHandRaiseElement(props) {
    return (
        <>
            <div className='handraise-container'>
                <div className='label'>INVITED</div>
                <div className='name'>{ props.request.name }</div>
                <div className='button-group'>
                    <Button variant="contained" children='Remove' size='small'  onClick={() => props.updateHandRaiseRequest(props.request.id, 'denied')}/>
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    padding: 20px 20px 30px 20px;
                    width: 270px;
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
        </>
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
        <>
            <div className='handraise-container'>
                <div className='label'>CONNECTING</div>
                <div className='name'>{ props.request.name }</div>
                <div className='button-group'>
                    <Button variant="contained" children='Remove' size='small'  onClick={() => updateHandRaiseRequest('denied')}/>
                </div>
            </div>  
            <style jsx>{`
                .handraise-container {
                    padding: 20px 20px 30px 20px;
                    width: 270px;
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
        </>
    )
}

function ConnectedHandRaiseElement(props) {

    const [notificationId, setNotificationId] = useState(uuidv4());
    const {getActiveTutorialStepKey, handleConfirmStep, isOpen} = useContext(TutorialContext);

    const activeStep = getActiveTutorialStepKey()


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
        <>
            <WhiteTooltip
                placement="right"
                title={
                    <React.Fragment>
                        <TooltipTitle>Hand Raise (4/5)</TooltipTitle>
                        <TooltipText>
                            At any time, you can remove a hand raiser by clicking on the corresponding button.
                        </TooltipText>
                        { activeStep === 12 && < TooltipButtonComponent onConfirm={() => {
                            handleConfirmStep(12)
                            updateHandRaiseRequest('denied')
                        }} buttonText="Ok"/>}
                    </React.Fragment>
                } open={isOpen(12)}>
                <div className='handraise-container'>
                    <div className='label'>CONNECTED</div>
                    <div className='name'>{ props.request.name }</div>
                    <div className='button-group'>
                        <Button variant="contained" children='Remove' size='small'  onClick={() => {
                            if (isOpen(12)) {
                                handleConfirmStep(12)
                            }
                            updateHandRaiseRequest('denied')        
                        }}/>
                    </div>
                </div>  
            </WhiteTooltip>
            <style jsx>{`
                .handraise-container {
                    padding: 20px 20px 30px 20px;
                    width: 270px;
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
        </>
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