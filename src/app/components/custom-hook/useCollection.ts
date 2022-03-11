import { useEffect, useState } from "react";
import { Identifiable } from "types/commonTypes";
import {
  useFirebaseService
} from "../../context/firebase/FirebaseServiceContext";
import { Interest } from "../../types/interests";
import { Group } from "../../types/groups";

/**
 * Fetch a Firestore collection
 *
 * We should migrate to something like ReactFire
 * TODO: Add query support
 * @param collection Name of the collection
 * @param realtime Listens for updates on the documents
 */
function useCollection<T extends Identifiable>(collection: string, realtime: boolean = false): CollectionResponse<T> {
  const { firestore } = useFirebaseService();
  const [documents, setDocuments] = useState<T[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    try {
      const ref = firestore.collection(collection);
      if (realtime) {
        return ref.onSnapshot(updateLocal);
      } else {
        ref.get().then(updateLocal);
      }
    } catch (e) {
      setLoading(false);
      setError(e);
    }

    function updateLocal(querySnapshot) {
      const list = [];
      querySnapshot.forEach(doc => {
        list.push({
          ...doc.data(),
          id: doc.id
        });
      });
      setDocuments(list);
      setLoading(false);
    }
  }, [realtime, collection]);

  return { isLoading: isLoading, data: documents, error: error };
};

interface CollectionResponse<T> {
  isLoading: boolean;
  data: T[];
  error: Error | null;
}

export const useInterests = (realtime: boolean = false) => useCollection<Interest>("interests", realtime);
export const useGroups = (realtime: boolean = false) => useCollection<Group>("careerCenterData", realtime);

export default useCollection;
