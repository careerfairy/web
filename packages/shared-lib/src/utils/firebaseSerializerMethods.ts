import firebase from "firebase/compat/app"
import "firebase/compat/firestore"
export const dateToFirebaseTimestamp = (date?: Date | number) => {
   return date ? firebase.firestore.Timestamp.fromDate(new Date(date)) : null
}
//
export const dateFromFirebaseTimestamp = (
   timestamp?: firebase.firestore.Timestamp
) => {
   return timestamp?.toDate?.() || null
}
