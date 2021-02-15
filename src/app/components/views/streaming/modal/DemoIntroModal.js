import React, {useState} from 'react';
import {withFirebase} from "../../../../context/firebase";
import {Button, DialogContentText} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import {GlassDialog} from "../../../../materialUI/GlobalModals";

const DemoIntroModal = ({firebase, livestreamId, open, handleClose}) => {
    const [loading, setLoading] = useState(false)

    const createTestLivestream = async () => {
        const testChatEntries = [{
            authorEmail: 'john@ethz.ch',
            authorName: 'John C',
            message: 'Hello!',
            timestamp: firebase.getFirebaseTimestamp('March 17, 2020 03:24:00')
        }, {
            authorEmail: 'marco@ethz.ch',
            authorName: 'Marco D',
            message: 'Thank you for having us!',
            timestamp: firebase.getFirebaseTimestamp('March 17, 2020 03:34:00')
        }, {
            authorEmail: 'david@ethz.ch',
            authorName: 'David P',
            message: 'Hi there!',
            timestamp: firebase.getFirebaseTimestamp('March 17, 2020 03:44:00')
        }];
        const testQuestionsEntries = [{
            author: 'john@ethz.ch',
            type: 'new',
            title: 'What is your interview process like?',
            timestamp: firebase.getFirebaseTimestamp('March 17, 2020 03:24:00'),
            votes: 24
        }, {
            author: 'john@ethz.ch',
            type: 'new',
            title: 'How has the company changed due to COVID?',
            timestamp: firebase.getFirebaseTimestamp('March 17, 2020 03:34:00'),
            votes: 20
        }];
        const testPolls = [{
            question: 'What should we discuss next?',
            state: 'upcoming',
            options: [{
                index: 0,
                name: 'Our next product',
                votes: 0
            }, {
                index: 1,
                name: 'What our internships look like',
                votes: 0
            }, {
                index: 2,
                name: 'Our personal story',
                votes: 0
            }],
            timestamp: firebase.getFirebaseTimestamp('March 17, 2020 03:24:00'),
            voters: []
        }];
        try {
            setLoading(true);
            await firebase.resetTestStream(livestreamId, testChatEntries, testQuestionsEntries, testPolls)
            handleClose(true) // handleClose should trigger some emotes
        } catch (e) {
            console.log(e)
        }
    }

    const handleStartDemo = async () => {
        await createTestLivestream()
    }

    return (
        <GlassDialog open={open}>
            <DialogTitle>
                Welcome to the Testing platform
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Would you like to partake in the tutorial?
                </DialogContentText>
                <DialogActions>
                    <Button onClick={handleStartDemo}
                            startIcon={loading && <CircularProgress size={20} color="inherit"/>}
                            disabled={loading}
                            variant="contained" color="primary">
                        Yes Please
                    </Button>
                    <Button onClick={() => handleClose(false)} disabled={loading} variant="contained">
                        No Thanks
                    </Button>
                </DialogActions>
            </DialogContent>
        </GlassDialog>
    );
};

export default withFirebase(DemoIntroModal);
