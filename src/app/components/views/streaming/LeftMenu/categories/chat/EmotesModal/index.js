import PropTypes from 'prop-types'
import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {v4 as uuidv4} from 'uuid'
import {Button, DialogActions, DialogContent, DialogTitle, List, Tab, Tabs} from "@material-ui/core";

import * as actions from '../../../../../../../store/actions'
import {GlassDialog} from "../../../../../../../materialUI/GlobalModals";
import {SwipeablePanel} from "../../../../../../../materialUI/GlobalPanels/GlobalPanels";
import {withFirebase} from "../../../../../../../context/firebase";
import {useCurrentStream} from "../../../../../../../context/stream/StreamContext";

import PanelDisplay from "./PanelDisplay";
import EmotesModalUser from "./EmotesModalUser";

const EmotesModal = ({onClose, chatEntry, firebase}) => {
    const dispatch = useDispatch()
    const audienceMap = useSelector(state => state.firestore.data.audience || {})
    const {currentLivestream: {id}} = useCurrentStream()
    const [value, setValue] = React.useState(0);
    const [emotes, setEmotes] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [all, setAll] = React.useState([]);

    useEffect(() => {
        if (chatEntry) {
            const {wow, heart, thumbsUp, laughing} = chatEntry
            const emotesWithData = [
                {label: "Wow", prop: "wow", data: wow, src: "/emojis/wow.png", alt: "😮"},
                {label: "Heart", prop: "heart", data: heart, src: "/emojis/heart.png", alt: "❤"},
                {label: "Thumbs Up", prop: "thumbsUp", data: thumbsUp, src: "/emojis/thumbsUp.png", alt: "👍"},
                {label: "Laughing", prop: "laughing", data: laughing, src: "/emojis/laughing.png", alt: "😆"}
            ]
                .filter(emote => emote.data?.length)
                .map((obj, index) =>
                    ({
                        ...obj,
                        index: index + 1,
                        data: obj.data.map(email => ({
                            email,
                            displayName: getDisplayNameFromEmail(email),
                            initials: getInitialsFromEmail(email),
                            avatar: audienceMap?.[email]?.avatarUrl || "",
                            emojiSrc: obj.src,
                            emojiAlt: obj.alt,
                            prop: obj.prop
                        }))
                    }))
            const allUsers = emotesWithData.reduce((acc, currentEmoteObj) => [...acc, ...currentEmoteObj.data], [])
            setAll(allUsers)
            setEmotes(emotesWithData)
        }
    }, [chatEntry, audienceMap])

    useEffect(() => {
        if (value > 0 && !emotes?.[value - 1]) {
            setValue(0)
        }
    }, [value, emotes])
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const getDisplayNameFromEmail = (email = "") => {
        let displayName = "Anonymous user"
        const userData = audienceMap?.[email]
        if (userData?.firstName && userData?.lastName) {
            displayName = `${userData.firstName} ${userData.lastName[0]}`
        } else if (email === "test@careerfairy.io") {
            displayName = "Test user"
        }
        return displayName
    }
    const getInitialsFromEmail = (email = "") => {
        let initials = ""
        const userData = audienceMap?.[email]
        if (userData?.firstName) {
            initials = `${userData.firstName[0]}`
            if (userData?.lastName) {
                initials = `${initials} ${userData.lastName[0]}`
            }
        }
        return initials
    }

    const handleUnEmote = useCallback(async (emoteProp, emoteEmail) => {
        try {
            setLoading(true)
            await firebase.unEmoteComment(id, chatEntry.id, emoteProp, emoteEmail)
        } catch (e) {
            dispatch(actions.sendGeneralError(e))
        }
        setLoading(false)
    }, [loading, id, chatEntry])

    const handleClose = () => {
        onClose()
    }


    return (
        <GlassDialog maxWidth="sm" fullWidth open={Boolean(chatEntry)} onClose={handleClose}>
            <DialogTitle>
                Message Reactions
            </DialogTitle>
            <Tabs indicatorColor="primary" value={value} onChange={handleChange} aria-label="simple tabs example">
                <Tab
                    label="All"
                />
                {emotes.map(({index, src, alt, data}) =>
                    <Tab
                        key={index}
                        label={
                            <PanelDisplay count={data.length} imageAlt={alt}
                                          imageSrc={src}/>
                        }
                    />)}
            </Tabs>
            <DialogContent dividers>
                <SwipeablePanel index={0} value={value}>
                    <List>
                        {all.map(({avatar, email, initials, displayName, emojiAlt, emojiSrc, prop}) =>
                            <EmotesModalUser key={email + prop}
                                             avatar={avatar}
                                             email={email}
                                             loading={loading}
                                             prop={prop}
                                             handleUnEmote={handleUnEmote}
                                             firebase={firebase}
                                             emojiAlt={emojiAlt}
                                             emojiSrc={emojiSrc}
                                             initials={initials}
                                             displayName={displayName}/>
                        )}
                    </List>
                </SwipeablePanel>
                {emotes.map(({data, index}) =>
                    <SwipeablePanel key={index} value={value} index={index}>
                        <List>
                            {data.map(({avatar, email, initials, displayName, emojiAlt, emojiSrc, prop}) =>
                                <EmotesModalUser
                                    key={email || uuidv4()}
                                    avatar={avatar}
                                    prop={prop}
                                    email={email}
                                    loading={loading}
                                    firebase={firebase}
                                    emojiSrc={emojiSrc}
                                    handleUnEmote={handleUnEmote}
                                    emojiAlt={emojiAlt}
                                    initials={initials}
                                    displayName={displayName}/>
                            )}
                        </List>
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

export default withFirebase(EmotesModal);

