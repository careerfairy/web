import React, {useContext, useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import {Button, Card, CardActions, CardHeader} from "@material-ui/core";
import TutorialContext from "context/tutorials/TutorialContext";
import {TooltipButtonComponent, TooltipText, TooltipTitle, WhiteTooltip} from "materialUI/GlobalTooltips";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles(theme => ({
    handRaiseContainerInvited: {
        width: "100%",
        background: theme.palette.primary.main,
        marginBottom: theme.spacing(1)
    },
    handRaiseContainerRequested: {
        width: "100%",
        marginBottom: theme.spacing(1)
    },
}))

function RequestedHandRaiseElement(props) {

    const classes = useStyles()
    const [notificationId, setNotificationId] = useState(uuidv4());
    const {
        tutorialSteps,
        setTutorialSteps,
        getActiveTutorialStepKey,
        handleConfirmStep,
        isOpen
    } = useContext(TutorialContext);

    const activeStep = getActiveTutorialStepKey()

    useEffect(() => {
        props.setNewNotification({
            id: notificationId,
            message: props.request.name + ' has haised a hand and requested to join the stream',
            confirmMessage: 'Invite',
            confirm: () => props.updateHandRaiseRequest(props.request.id, 'invited'),
            cancelMessage: 'Deny',
            cancel: () => props.updateHandRaiseRequest(props.request.id, 'denied'),
        });
    }, []);

    function updateHandRaiseRequest(state) {
        props.updateHandRaiseRequest(props.request.id, state);
        props.setNotificationToRemove(notificationId);
    }

    return (
        <WhiteTooltip
            placement="right-start"
            style={{width: "100%"}}
            title={
                <React.Fragment>
                    <TooltipTitle>Hand Raise (2/5)</TooltipTitle>
                    <TooltipText>
                        All the viewers who request to join your stream appear here. You can invite them in by
                        clicking on the corresponding button.
                    </TooltipText>
                    {activeStep === 10 && < TooltipButtonComponent onConfirm={() => {
                        handleConfirmStep(10)
                        updateHandRaiseRequest('connected')
                    }} buttonText="Ok"/>}
                </React.Fragment>
            } open={Boolean(props.hasEntered && isOpen(10))}>
            <Card className={classes.handRaiseContainerRequested}>
                <CardHeader
                    title="HAND RAISED"
                    subheader={props.request.name}
                />
                <CardActions>
                    <Button variant="contained" style={{marginRight: "1rem"}} children='Invite to speak'
                            size='small' onClick={() => {
                        if (isOpen(10)) {
                            handleConfirmStep(10)
                            updateHandRaiseRequest('connected')
                        } else {
                            updateHandRaiseRequest('invited')
                        }
                    }} color="primary"/>
                    <Button variant="contained" color="default" children='Deny' size='small' disabled={isOpen(10)}
                            onClick={() => updateHandRaiseRequest('denied')}/>
                </CardActions>
            </Card>
        </WhiteTooltip>
    )
}

function InvitedHandRaiseElement(props) {
    const classes = useStyles()
    return (
        <Card className={classes.handRaiseContainerInvited}>
            <CardHeader
                title="INVITED"
                subheader={props.request.name}
            />
            <CardActions>
                <Button variant="contained" children='Remove' size='small'
                        onClick={() => props.updateHandRaiseRequest(props.request.id, 'denied')}/>
            </CardActions>
        </Card>
    )
}

function ConnectingHandRaiseElement(props) {
    const classes = useStyles()

    const [notificationId, setNotificationId] = useState(uuidv4());

    useEffect(() => {
        props.setNewNotification({
            id: notificationId,
            message: props.request.name + ' is now connecting to the stream',
            confirmMessage: 'OK',
            confirm: () => {
            },
            cancelMessage: 'Stop Connection',
            cancel: () => props.updateHandRaiseRequest(props.request.id, 'denied'),
        });
    }, [])

    function updateHandRaiseRequest(state) {
        props.updateHandRaiseRequest(props.request.id, state);
        props.setNotificationToRemove(notificationId);
    }

    return (
        <Card className={classes.handRaiseContainerInvited}>
            <CardHeader
                title="CONNECTING"
                subheader={props.request.name}
            />
            <CardActions>
                <Button variant="contained" children='Remove' size='small'
                        onClick={() => updateHandRaiseRequest('denied')}/>
            </CardActions>
        </Card>
    )
}

function ConnectedHandRaiseElement(props) {
    const classes = useStyles()

    const [notificationId, setNotificationId] = useState(uuidv4());
    const {getActiveTutorialStepKey, handleConfirmStep, isOpen} = useContext(TutorialContext);

    const activeStep = getActiveTutorialStepKey()


    useEffect(() => {
        props.setNewNotification({
            id: notificationId,
            message: props.request.name + ' is now connected to the stream',
            confirmMessage: 'OK',
            confirm: () => {
            },
            cancelMessage: 'Remove from Stream',
            cancel: () => props.updateHandRaiseRequest(props.request.id, 'denied'),
        });
    }, [])

    function updateHandRaiseRequest(state) {
        props.updateHandRaiseRequest(props.request.id, state);
        props.setNotificationToRemove(notificationId);
    }

    return (
        <WhiteTooltip
            placement="right"
            style={{width: "100%"}}
            title={
                <React.Fragment>
                    <TooltipTitle>Hand Raise (4/5)</TooltipTitle>
                    <TooltipText>
                        At any time, you can remove a hand raiser by clicking on the corresponding button.
                    </TooltipText>
                    {activeStep === 12 && < TooltipButtonComponent onConfirm={() => {
                        handleConfirmStep(12)
                        updateHandRaiseRequest('denied')
                    }} buttonText="Ok"/>}
                </React.Fragment>
            } open={isOpen(12)}>
            <Card className={classes.handRaiseContainerInvited}>
                <CardHeader
                    title="CONNECTED"
                    subheader={props.request.name}
                />
                <CardActions>
                    <Button variant="contained" children='Remove' size='small' onClick={() => {
                        if (isOpen(12)) {
                            handleConfirmStep(12)
                        }
                        updateHandRaiseRequest('denied')
                    }}/>
                </CardActions>
            </Card>
        </WhiteTooltip>
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