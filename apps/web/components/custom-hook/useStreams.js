import React, { useEffect, useState } from "react"

const useListenToStreams = (query, id) => {
   const [streams, setStreams] = useState(null)
   const [loading, setLoading] = useState(false)

   useEffect(() => {
      if (id) {
         setLoading(true)
         const unsubscribe = query(id, (querySnapshot) => {
            const streamsData = querySnapshot.docs.map((doc) => ({
               id: doc.id,
               ...doc.data(),
            }))
            setStreams(streamsData)
            setLoading(false)
         })
         return () => unsubscribe()
      }
   }, [])

   return { streams, loading }
}

export default useListenToStreams
