import React, {useState, useEffect} from 'react';
import {withFirebase} from 'context/firebase';
import HandRaisePriorRequest from './hand-raise/active/HandRaisePriorRequest';
import HandRaiseRequested from './hand-raise/active/HandRaiseRequested';
import HandRaiseDenied from './hand-raise/active/HandRaiseDenied';
import HandRaiseConnecting from './hand-raise/active/HandRaiseConnecting';
import HandRaiseConnected from './hand-raise/active/HandRaiseConnected';
import UserContext from 'context/user/UserContext';
import HandRaiseInactive from './hand-raise/inactive/HandRaiseInactive';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import {Button, Typography, useTheme} from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import {useAuth} from "../../../../../HOCs/AuthProvider";

function HandRaiseCategory(props) {
    const theme = useTheme()
    const {authenticatedUser, userData} = useAuth();
    const [handRaiseState, setHandRaiseState] = useState(null);

    useEffect(() => {
        if (props.livestream.test || authenticatedUser) {
            let authEmail = props.livestream.test ? 'streamerEmail' : authenticatedUser.email;
            if (props.livestream && authEmail) {
                props.firebase.listenToHandRaiseState(props.livestream.id, authEmail, querySnapshot => {
                    if (querySnapshot.exists) {
                        let request = querySnapshot.data();
                        setHandRaiseState(request);
                    }
                });
            }
        }
    }, [props.livestream, authenticatedUser]);

    useEffect(() => {
        if (handRaiseState && (handRaiseState.state === "connecting" || handRaiseState.state === "connected")) {
            props.setHandRaiseActive(true);
        } else {
            props.setHandRaiseActive(false);
        }
    }, [handRaiseState]);

    function updateHandRaiseRequest(state) {
        if (props.livestream.test || authenticatedUser.email) {
            let authEmail = props.livestream.test ? 'streamerEmail' : authenticatedUser.email;
            let checkedUserData = props.livestream.test ? {firstName: 'Test', lastName: 'Streamer'} : userData;
            if (handRaiseState) {
                props.firebase.updateHandRaiseRequest(props.livestream.id, authEmail, state);
            } else {
                props.firebase.createHandRaiseRequest(props.livestream.id, authEmail, checkedUserData);
            }
        }
    }

    if (!props.livestream.handRaiseActive) {
        return <HandRaiseInactive selectedState={props.selectedState}/>;
    }

    return (
        <>
            <HandRaisePriorRequest handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <HandRaiseRequested handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <HandRaiseDenied handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <HandRaiseConnecting handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <HandRaiseConnected handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <Dialog open={handRaiseState && handRaiseState.state === "invited"}>
                <DialogContent>
                    <Typography align="center" style={{
                        fontFamily: 'Permanent Marker',
                        fontSize: "2em",
                        color: theme.palette.primary.main,
                    }}>You've been invited to join the stream!</Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" children='Join now' icon='checkmark' size='huge' color="primary"
                            onClick={() => updateHandRaiseRequest('connecting')}/>
                    <Button variant="contained" children='Cancel' size='huge' icon='delete'
                            onClick={() => updateHandRaiseRequest('unrequested')}/>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default withFirebase(HandRaiseCategory);