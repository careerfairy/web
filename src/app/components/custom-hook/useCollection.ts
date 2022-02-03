import {useEffect, useState} from "react";
import {useFirebaseService} from "../../context/firebase/FirebaseServiceContext"

/**
 * Fetch a Firestore collection
 *
 * We should migrate to something like ReactFire
 * TODO: Add query support
 * @param collection Name of the collection
 * @param realtime Listens for updates on the documents
 */
function useCollection<T extends Identifiable>(collection: string, realtime: boolean = false): T[] {
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
        list.push({
          ...doc.data(),
          id: doc.id
        })
      })
      setInterests(list)
    }
  }, [realtime]);


  return interests;
};

/**
 * Every firebase document should have an ID
 */
export interface Identifiable {
  id: string
}

export default useCollection;
