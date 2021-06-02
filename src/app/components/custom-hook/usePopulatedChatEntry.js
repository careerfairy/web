import React, {useMemo} from 'react';
import {populate, useFirestoreConnect} from "react-redux-firebase";
import {shallowEqual, useSelector} from "react-redux";
import {useRouter} from "next/router";

const usePopulatedChatEntry = (chatEntry) => {
    const {query: {livestreamId, breakoutRoomId}} = useRouter()

    const populates = [
        {child: 'wow', root: 'userData'},
        {child: 'heart', root: 'userData',},
        {child: 'laughing', root: 'userData'},
        {child: 'thumbsUp', root: 'userData'},
    ]


    const query = useMemo(() => {
        let query = []
        if (chatEntry?.id) {
            if (breakoutRoomId) {
                query = [
                    {
                        collection: "livestreams",
                        doc: livestreamId,
                        subcollections: [{
                            collection: "breakoutRooms",
                            doc: breakoutRoomId,
                            subcollections: [{
                                collection: "chatEntries",
                                doc: chatEntry.id,
                            }],
                        }],
                        populates,
                        storeAs: "currentChatEntry"
                    }
                ]
            } else {
                query = [
                    {
                        collection: "livestreams",
                        doc: livestreamId,
                        subcollections: [{
                            collection: "chatEntries",
                            doc: chatEntry.id,
                        }],
                        populates,
                        storeAs: "currentChatEntry"
                    }
                ]
            }
        }
        return query
    }, [chatEntry?.id, breakoutRoomId, livestreamId])

    useFirestoreConnect(query)

    return useSelector(({firestore}) => populate(firestore, "currentChatEntry", populates), shallowEqual);
}

export default usePopulatedChatEntry;