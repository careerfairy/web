import React from 'react';
import {useFirebase} from "../../context/firebase/FirebaseContext";
import {useRouter} from "next/router";


const useStreamRef = () => {
    const router = useRouter()
    const {getStreamRef} = useFirebase()
    return getStreamRef(router)
};

export default useStreamRef;
