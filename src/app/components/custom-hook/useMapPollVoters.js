import React, {useEffect} from 'react';

/**
 * The callback function that is used to set the chart data for the graph
 * @callback setChartDataCallback
 * @param {*} prevState
 */

/**
 * Map the poll voters to the Chart data state
 * @param {string} pollId - The id of the poll you wish to get votes from
 * @param {string} livestreamId - The id of the livestream the poll belongs to
 * @param {setChartDataCallback} setChartData - The callback function that is used to set the chart data for the graph
 * @param {({listenToPollVoters: function})} firebase - The firebase object containing the method for listening to poll voters
 * @param {{optionId: string, timestamp: string}[]} demoVotes - A simulated array of demo votes
 */
const useMapPollVoters = (pollId, livestreamId, setChartData, firebase, demoVotes) => {

    useEffect(() => {
        // listen to option data
        if (pollId && livestreamId && !demoVotes) {
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
    }, [pollId, livestreamId, demoVotes])

    useEffect(() => {
        if(demoVotes){
            setChartData(prevState => {
                const newData = prevState.ids.map(optionId => {
                    return demoVotes.filter(vote => vote?.optionId === optionId).length
                })
                return {
                    ...prevState,
                    datasets: prevState.datasets.map(dataset => ({
                        ...dataset,
                        data: newData
                    }))
                }
            })
        }
    },[demoVotes])
};

export default useMapPollVoters;
