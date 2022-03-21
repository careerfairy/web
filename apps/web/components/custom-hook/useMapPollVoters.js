import React, { useEffect } from "react"

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
 * @param {object} [streamRef] - Direct firestore reference of the stream, ref will be used instead of livestreamId if provided
 */
const useMapPollVoters = (
   pollId,
   livestreamId,
   setChartData,
   firebase,
   demoVotes,
   streamRef
) => {
   useEffect(() => {
      // listen to option data
      if (pollId && streamRef && !demoVotes) {
         const unsubscribe = firebase.listenToPollVotersWithStreamRef(
            streamRef,
            pollId,
            (querySnapshot) => {
               setQuerySnapShotData(querySnapshot)
            }
         )
         return () => unsubscribe()
      } else if (pollId && livestreamId && !demoVotes) {
         const unsubscribe = firebase.listenToPollVoters(
            livestreamId,
            pollId,
            (querySnapshot) => {
               setQuerySnapShotData(querySnapshot)
            }
         )
         return () => unsubscribe()
      }
   }, [pollId, livestreamId, demoVotes])

   useEffect(() => {
      if (demoVotes) {
         setChartData((prevState) => {
            const newData = prevState.ids.map((optionId) => {
               return demoVotes.filter((vote) => vote?.optionId === optionId)
                  .length
            })
            return {
               ...prevState,
               datasets: prevState.datasets.map((dataset) => ({
                  ...dataset,
                  data: newData,
               })),
            }
         })
      }
   }, [demoVotes])

   const setQuerySnapShotData = (querySnapshot) => {
      const totalVotes = querySnapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
      }))
      setChartData((prevState) => {
         const newData = prevState.ids.map((optionId) => {
            return totalVotes.filter((vote) => vote?.optionId === optionId)
               .length
         })
         return {
            ...prevState,
            datasets: prevState.datasets.map((dataset) => ({
               ...dataset,
               data: newData,
            })),
         }
      })
   }
}

export default useMapPollVoters
