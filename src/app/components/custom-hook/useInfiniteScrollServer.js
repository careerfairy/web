import { useEffect, useState } from "react";

const useInfiniteScrollServer = ({ limit = 5, query }) => {
   const [docs, setDocs] = useState([]);
   const [lastDoc, setLastDoc] = useState(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      (async function () {
         const { lastDoc, docs } = await getInitialQuery();
         setDocs(docs);
         setLastDoc(lastDoc);
      })();
   }, []);

   const getInitialQuery = async () => {
      console.log("-> getInitialQuery");
      try {
         setLoading(true);
         const data = await query.limit(limit).get();
         let docs = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
         const newLastDoc = data.docs[data.docs.length - 1];
         return { docs, lastDoc: newLastDoc };
      } catch (e) {
         console.log(e);
      }
      setLoading(false);
   };

   const getMore = async () => {
      console.log("-> getMore");
      if (!lastDoc) return;
      try {
         setLoading(true);
         const data = await query.startAfter(lastDoc).limit(limit).get();
         let docs = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
         const newLastDoc = data.docs[data.docs.length - 1];
         setDocs((prevState) => prevState.concat(docs));
         setLastDoc(newLastDoc);
      } catch (e) {
         console.log(e);
      }
      setLoading(false);
   };

   // const handleScroll = () => {
   //    const bottom =
   //       Math.ceil(window.innerHeight + window.scrollY) >=
   //       document.documentElement.scrollHeight * 0.5;
   //    console.log("-> bottom", bottom);
   //    console.log("-> lastDoc", lastDoc);
   //    if (bottom && lastDoc !== undefined) {
   //       return getMore();
   //    }
   // };

   return { getMore, hasMore: lastDoc !== undefined, docs, loading };
};

export default useInfiniteScrollServer;
