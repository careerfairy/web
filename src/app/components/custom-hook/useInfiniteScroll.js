import {useEffect, useState} from "react";


const useInfiniteScroll = (query, limit = 3) => {
    const [initialSet, setInitialSet] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [items, setItems] = useState([])
    const [totalItems, setTotalItems] = useState([])
    const [end, setEnd] = useState(limit)
    console.log("-->hasMore", hasMore);

    useEffect(() => {
        if (!initialSet && totalItems.length) {
            getInitial()
        }
    }, [initialSet, totalItems.length])


    useEffect(() => {
        const unsubscribe = query.onSnapshot(querySnapshot => {
            let tempItems = []
            querySnapshot.forEach(doc => {
                const data = doc.data()
                data.id = doc.id
                tempItems.push(data)
            })
            setTotalItems(tempItems)
        })
        return () => unsubscribe()
    }, [])

    const getInitial = () => {
        setItems(totalItems.slice(0, end))
    }


    const getMore = () => {
        const stillMore = Boolean(totalItems.length > items.length)
        if (stillMore) {
            const newEnd = end + limit
            const paginatedItems = totalItems.slice(0, end)
            setItems(paginatedItems)
            setEnd(newEnd)
        } else {
            setHasMore(false)
        }
    }

    return [items, getMore, hasMore]
}

export default useInfiniteScroll