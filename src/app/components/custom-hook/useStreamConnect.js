import React, {useMemo} from 'react';
import {useFirestoreConnect} from "react-redux-firebase";
import {shallowEqual, useSelector} from "react-redux";
import {useRouter} from "next/router";
import currentLivestreamSelector from "../selectors/currentLivestreamSelector";

const useStreamConnect = () => {
    const {query: {livestreamId}} = useRouter()

    const query = useMemo(() => {
        let query = []
        if (livestreamId) {
                query = [
                    {
                        collection: "livestreams",
                        doc: livestreamId,
                        storeAs: "currentLivestream",
                    }
                ]
        }
        return query
    }, [livestreamId])

    useFirestoreConnect(query)

    return useSelector(state =>
            currentLivestreamSelector(state, {streamId: livestreamId}),
        shallowEqual)
}

export default useStreamConnect;