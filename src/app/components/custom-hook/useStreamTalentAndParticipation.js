import {useEffect} from "react";


const useStreamTalentAndParticipation = (firebase, streams) => {

    const [streamsWidthData, setStreamsWidthData] = useState([]);

    useEffect(() => {
        (async function () {
            if (streams?.length) {
                const newStreams = [...streams]
                for (stream of newStreams) {
                    const talentPoolData = await firebase.getLivestreamTalentPoolMembers(stream.companyId)

                }

            }
        })()
    }, [streams])
}

export default useStreamTalentAndParticipation