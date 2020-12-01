import {useEffect, useState} from "react";


const useInfiniteScroll = (query, limit = 3) => {
    const [hasMore, setHasMore] = useState(false)
    const [items, setItems] = useState([])
    const [localItems, setLocalItems] = useState([])
    const [localLimit, setLocalLimit] = useState(limit)

    useEffect(() => {
        setHasMore(Boolean(localItems.length > items.length))
    }, [localItems.length, items.length])

    useEffect(() => {
        const paginatedItems = localItems.slice(0, localLimit)
        setItems(paginatedItems)
    }, [localLimit, localItems])


    useEffect(() => {
        const unsubscribe = query.onSnapshot(querySnapshot => {
            let tempItems = []
            querySnapshot.forEach(doc => {
                const data = doc.data()
                data.id = doc.id
                tempItems.push(data)
            })
            setLocalItems(tempItems)
        })
        return () => unsubscribe()
    }, [])


    const getMore = () => {
        if (hasMore) {
            setLocalLimit(prevState => prevState + limit)
        }
    }

    return [items, getMore, hasMore]
}

export default useInfiniteScroll