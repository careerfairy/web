import React, {useEffect} from 'react';

const useMapPollVoters = (pollId, livestreamId, setChartData, firebase) => {

    useEffect(() => {
        // listen to option data
        if (pollId && livestreamId) {
            const unsubscribe = firebase.listenToPollVoters(livestreamId, pollId, querySnapshot => {
                const totalVotes = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
                setChartData(prevState => {
                    const newData = prevState.ids.map(optionId => {
                        return totalVotes.filter(vote => vote?.optionId === optionId).length
                    })
                    return {
                        ...prevState,
                        datasets: prevState.datasets.map(dataset => ({
                            ...dataset,
                            data: newData
                        }))
                    }
                })
            })
            return () => unsubscribe()
        }
    }, [pollId, livestreamId])
};

export default useMapPollVoters;
