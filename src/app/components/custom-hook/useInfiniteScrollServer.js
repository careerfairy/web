import { useEffect, useState } from "react";

const useInfiniteScrollServer = ({ limit = 5, query }) => {
   const [docs, setDocs] = useState([]);
   const [lastDoc, setLastDoc] = useState(null);
   const [loading, setLoading] = useState(false);
   const [loadingInitial, setLoadingInitial] = useState(false);

   useEffect(() => {
      if (query) {
         getInitialQuery();
      }
   }, [query]);

   const getInitialQuery = async () => {
      try {
         if (loading) return;
         setLoadingInitial(true);
         const data = await query.limit(limit).get();
         const initialDocs = data.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));
         const newLastDoc =
            data.docs.length < limit
               ? undefined
               : data.docs[data.docs.length - 1];
         setDocs(initialDocs);
         setLastDoc(newLastDoc);
      } catch (e) {
         console.log("-> e", e);
      } finally {
         setLoadingInitial(false);
      }
   };

   const getMore = async () => {
      if (!lastDoc || loading || loadingInitial) return;
      try {
         setLoading(true);
         const data = await query.startAfter(lastDoc).limit(limit).get();
         let docs = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
         const newLastDoc = data.docs[data.docs.length - 1];
         setDocs((prevState) => prevState.concat(docs));
         setLastDoc(newLastDoc);
      } catch (e) {
         console.log(e);
      } finally {
         setLoading(false);
      }
   };

   const handleClientUpdate = (docId, updateData) => {
      setDocs((prevState) =>
         prevState.map((doc) =>
            doc.id === docId ? { ...doc, ...updateData } : doc
         )
      );
   };

   return {
      getMore,
      hasMore: lastDoc !== undefined,
      docs,
      loading,
      handleClientUpdate,
      loadingInitial,
      getInitialQuery,
   };
};

export default useInfiniteScrollServer;
