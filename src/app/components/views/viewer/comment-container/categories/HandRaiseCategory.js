import React, {useState, useEffect, Fragment} from 'react';

import {withFirebase} from 'context/firebase';
import HandRaisePriorRequest from './hand-raise/active/HandRaisePriorRequest';
import HandRaiseRequested from './hand-raise/active/HandRaiseRequested';
import HandRaiseDenied from './hand-raise/active/HandRaiseDenied';
import HandRaiseConnecting from './hand-raise/active/HandRaiseConnecting';
import HandRaiseConnected from './hand-raise/active/HandRaiseConnected';
import UserContext from 'context/user/UserContext';
import HandRaiseInactive from './hand-raise/inactive/HandRaiseInactive';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import {Button, useTheme} from "@material-ui/core";

function HandRaiseCategory(props) {
    const theme = useTheme()

    if (!props.livestream.handRaiseActive) {
        return <HandRaiseInactive selectedState={props.selectedState}/>;
    }

    const {authenticatedUser, userData} = React.useContext(UserContext);
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

    return (
        <>
            <HandRaisePriorRequest handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <HandRaiseRequested handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <HandRaiseDenied handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <HandRaiseConnecting handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <HandRaiseConnected handRaiseState={handRaiseState} updateHandRaiseRequest={updateHandRaiseRequest}/>
            <Dialog open={handRaiseState && handRaiseState.state === "invited"}>

                <DialogTitle style={{
                    fontFamily: 'Permanent Marker',
                    fontSize: "2em",
                    color: theme.palette.primary.main,
                    margin: "30px 0 50px 0"
                }}>You've been invited to join the stream!</DialogTitle>
                <DialogActions>
                    <Button variant="contained" children='Join now' icon='checkmark' size='huge' color="primary"
                            onClick={() => updateHandRaiseRequest('connecting')}/>
                    <Button variant="contained" children='Cancel' size='huge' icon='delete'
                            onClick={() => updateHandRaiseRequest('unrequested')}/>
                </DialogActions>
                <style jsx>{`
                        .main-title {
                            text-align: center;
                            font-family: 'Permanent Marker';
                            font-size: 2em;
                            color: rgb(0, 210, 170);
                            margin: 30px 0 50px 0;
                        }

                        .buttons {
                            text-align: center;
                            margin: 20px auto 10px auto;
                        }
                    `}</style>

            </Dialog>
        </>
    );
}

export default withFirebase(HandRaiseCategory);