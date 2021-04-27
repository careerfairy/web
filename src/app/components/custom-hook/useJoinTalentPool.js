import React, {useState} from 'react';
import {useRouter} from "next/router";

const useJoinTalentPool = () => {
    const {query:{livestreamId, breakoutRoomId}} = useRouter()
    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);

    return {};
}

export default useJoinTalentPool;