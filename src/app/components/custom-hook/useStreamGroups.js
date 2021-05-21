import React, {useEffect, useState} from 'react';

const useStreamGroups = (groupIds, firebase) => {
    const [careerCenters, setCareerCenters] = useState([]);

    useEffect(() => {

        async function getCareerCenters() {
            try {
                const newCareerCenters = await firebase.getGroupsWithIds(groupIds)
                setCareerCenters(newCareerCenters)
            } catch (e) {
            }
        }

        if (groupIds?.length) {
            getCareerCenters()
        }

    }, [groupIds])

    return careerCenters;
}

export default useStreamGroups;