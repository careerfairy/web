import {useEffect, useState} from "react";
import {useFirebaseService} from "../../context/firebase/FirebaseServiceContext"

/**
 * Fetch a Firestore collection
 *
 * We should migrate to something like ReactFire
 * @param collection Name of the collection
 * @param realtime Listens for updates on the documents
 */
function useCollection<T>(collection: string, realtime: boolean = false): T[] {
  const {firestore} = useFirebaseService();
  const [interests, setInterests] = useState<T[]>([])

  useEffect(() => {
    const ref = firestore.collection(collection)

    if (realtime) {
      return ref.onSnapshot(updateLocal)
    } else {
      ref.get().then(updateLocal)
    }

    function updateLocal(querySnapshot) {
      const list = []
      querySnapshot.forEach(doc => {
        list.push(doc.data())
      })
      setInterests(list)
    }
  }, [realtime]);


  return interests;
};

export default useCollection;
