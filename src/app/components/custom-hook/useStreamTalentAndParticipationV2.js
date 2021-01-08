import React, {useEffect, useState} from "react";
import {snapShotsToData} from "../helperFunctions/HelperFunctions";


const useStreamTalentAndParticipationV2 = (firebase, streams) => {

    const [updatedStreams, setUpdatedStreams] = useState([]);

    useEffect(() => {
        if(streams.length){
            const arrayOfIds = getStreamIds()


        }
        setUpdatedStreams(streams)
    }, [streams])

    useEffect(() => {
        (async function () {
            if (streams?.length) {
                const newStreams = [...streams]
                for (const livestream of newStreams) {
                    const talentPoolSnapShots = await firebase.getLivestreamTalentPoolMembers(livestream.companyId)
                    livestream.talentPool = snapShotsToData(talentPoolSnapShots)
                }
                setUpdatedStreams(newStreams)
            }
        })()
    }, [streams])

    const getStreamIds = (streams) => {
        return streams.map(stream => stream.id)
    }

    return {updatedStreams}
}

export default useStreamTalentAndParticipationV2