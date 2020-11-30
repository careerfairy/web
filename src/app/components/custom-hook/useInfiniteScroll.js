import {useEffect, useState} from "react";


const useInfiniteScroll = (query, options) => {
    const {limit} = options
    const [hasMore, setHasMore] = useState(false)
    const [items, setItems] = useState([])
    const [localQuery, setLocalQuery] = useState(null)
    const [lastVisible, setLastVisible] = useState(null)

    useEffect(() => {
        setLocalQuery(query.limit(limit))
    }, [])

    useEffect(() => {
        if (localQuery) {
            const unsubscribe = localQuery.onSnapshot(querySnapshot => {
                const lastTempVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                if (lastTempVisible) {
                    setHasMore(true)
                    setLastVisible(lastTempVisible)
                } else {
                    setHasMore(false)
                }
                const tempItems = []
                querySnapshot.forEach(doc => {
                    const data = doc.data()
                    data.id = doc.id
                    tempItems.push(data)
                })
                setItems(tempItems)
            })

            return () => unsubscribe()
        }
    }, [localQuery])

    const getMore = () => {
        setLocalQuery(query.startAfter(lastVisible).limit(limit))
    }

    return [items, getMore, hasMore]
}

export default useInfiniteScroll