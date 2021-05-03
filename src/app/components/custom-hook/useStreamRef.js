import React, {useMemo} from 'react';
import {useFirebase} from "context/firebase";
import {useRouter} from "next/router";

/**
 * Gets the firestore document reference either for a normal livestream.
 * @return {({
 * id: string,
 * collection: function,
 * get: function,
 * update: function,
 * delete: function,
 * })} - firestore document reference
 */
const useStreamRef = () => {
    const router = useRouter()
    const {getStreamRef} = useFirebase()
    return useMemo(() => getStreamRef(router), [router])
};

export default useStreamRef;
