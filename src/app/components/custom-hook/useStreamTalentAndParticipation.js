import {useEffect} from "react";
import {snapShotsToData} from "../helperFunctions/HelperFunctions";


const useStreamTalentAndParticipation = (firebase, streams) => {

    const [updatedStreams, setUpdatedStreams] = useState([]);

    useEffect(() => {
        (async function () {
            if (streams?.length) {
                const newStreams = [...streams]
                for (const livestream of newStreams) {
                    const talentPoolSnapShots = await firebase.getLivestreamTalentPoolMembers(livestream.companyId)
                    const participatingStudentsSnapShots = await firebase.getLivestreamParticipatingStudents(livestream.id)
                    livestream.talentPool = snapShotsToData(talentPoolSnapShots)
                    livestream.participatingStudents = snapShotsToData(participatingStudentsSnapShots)
                }
                setUpdatedStreams(newStreams)
            }
        })()
    }, [streams])

    return {updatedStreams}
}

export default useStreamTalentAndParticipation