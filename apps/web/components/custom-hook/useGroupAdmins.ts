import useCollection from "./useCollection"

/*
 * This is a custom hook that will fetch the group admins from Firestore
 * and return them as an array of GroupAdmin objects
 * @param groupId
 * @returns GroupAdmin[]
 * */
const useGroupAdmins = (groupId) => {
   return useCollection(`careerCenterData/${groupId}/admins`, true)

   // // The useFirestoreCollectionData hook cannot be used here since it has a bug
   // // when trying to access data that is protected by rules on auth sing-in re-direct:
   // // issue # [228](https://github.com/FirebaseExtended/reactfire/discussions/228)
   // How to reproduce: uncomment bellow, go to roles page, sign out, then sign in again, it should redirect to roles page and crash
   // const collectionRef = collection(
   //    useFirestore(),
   //    "careerCenterData",
   //    groupId,
   //    "admins"
   // )
   // return useFirestoreCollectionData<GroupAdmin>(collectionRef as any, {
   //    idField: "id", // this field will be added to the firestore object
   //    suspense: true,
   // })
}

export default useGroupAdmins
