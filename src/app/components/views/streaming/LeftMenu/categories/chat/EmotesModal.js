import PropTypes from 'prop-types'
import React, {useEffect} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {GlassDialog} from "../../../../../../materialUI/GlobalModals";
import {useFirestoreConnect} from "react-redux-firebase";
import {useCurrentStream} from "../../../../../../context/stream/StreamContext";
import {useSelector} from "react-redux";
import {AppBar, Button, DialogActions, DialogContent, DialogTitle, Tab, Tabs} from "@material-ui/core";
import {SwipeablePanel} from "../../../../../../materialUI/GlobalPanels/GlobalPanels";

const useStyles = makeStyles(theme => ({}));

const EmotesModal = ({onClose, chatEntry}) => {
    const classes = useStyles()
    const audienceMap = useSelector(state => state.firestore.data.audience || {})
    const [value, setValue] = React.useState(0);
    const [emotes, setEmotes] = React.useState([]);

    useEffect(() => {
        if (chatEntry) {
            const {wow, heart, thumbsUp, laughing} = chatEntry
            const emotesWithData = [{label: "Wow", data: wow}, {label: "Heart", data: heart}, {
                label: "Thumbs Up",
                data: thumbsUp
            }, {label: "Laughing", data: laughing}]
                .filter(emote => emote.data?.length)
                .map((obj, index) => ({...obj, index}))
            setEmotes(emotesWithData)
        }
    }, [chatEntry])
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    console.log("-> audienceMap", audienceMap);
    console.log("-> chatEntry", chatEntry);

    // useFirestoreConnect(() => chatEntryId ? [{
    //     collection: "livestreams",
    //     doc: currentLivestream.id,
    //     subcollections: [{
    //         collection: "chatEntries",
    //         doc: chatEntryId,
    //     }]
    // }] : [])

    const handleClose = () => {
        onClose()
    }

    return (
        <GlassDialog open={Boolean(chatEntry)} onClose={handleClose}>
            <DialogTitle>
                Message Reactions
            </DialogTitle>
            <Tabs indicatorColor="primary" value={value} onChange={handleChange} aria-label="simple tabs example">
                {emotes.map(({label, index}) => <Tab key={index} label={label}/>)}
            </Tabs>
            <DialogContent dividers>
                {emotes.map(({data, index}) => <SwipeablePanel key={index} value={value} index={index}>
                    {data}
                </SwipeablePanel>)}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </GlassDialog>
    );
};

EmotesModal.propTypes = {
    chatEntry: PropTypes.object,
    onClose: PropTypes.func.isRequired
}

export default EmotesModal;

