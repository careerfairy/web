import { useState, useEffect, useCallback } from 'react'
import { useCollectionOnce, useCollectionData } from 'react-firebase-hooks/firestore'
import {snapShotsToData} from "../helperFunctions/HelperFunctions";

const useFirestoreLoadMore = (queryFn, limit = 10) => {
    const [query, setQuery] = useState(null)
    const [last, setLast] = useState(null)
    const [data, setData] = useState([])
    const [hasMore, setHasMore] = useState(true);

    const [qData, loading, error] = useCollectionOnce(query)

    useEffect(() => {
        setData([])
        setQuery(queryFn().limit(limit))
    }, [queryFn])

    useEffect(() => {
        if (qData && qData.query.isEqual(query)) {
            if(!qData.docs.length){
                setHasMore(false)
            }
            setLast(qData.docs[qData.docs.length - 1])
            const extractedData = snapShotsToData(qData.docs)
            setData([...data, ...extractedData])
        }
    }, [qData])

    useEffect(() => {

    },[])

    const more = useCallback(() => {
        setQuery(queryFn().startAfter(last))
    }, [queryFn, setQuery, last])

    return [[data, loading, error, hasMore], more]
}



export default useFirestoreLoadMore