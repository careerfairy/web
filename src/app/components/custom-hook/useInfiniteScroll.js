import {useEffect, useState, useCallback} from "react";


const useInfiniteScroll = (query, options) => {
    const {limit} = options
    const [hasMore, setHasMore] = useState(false)
    const [items, setItems] = useState([])
    const [localLimit, setLocalLimit] = useState(limit)

    useEffect(() => {
        IDefineMyListener()
        return () => IDefineMyListener()
    }, [localLimit])

    const IDefineMyListener = useCallback(event => {
        return query.limit(localLimit).onSnapshot(querySnapshot => {
            const lastTempVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            if (lastTempVisible) {
                setHasMore(true)
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

    }, [localLimit]);

    const getMore = () => {
        setLocalLimit(prevLimit => prevLimit + limit)
    }

    return [items, getMore, hasMore]
}

export default useInfiniteScroll