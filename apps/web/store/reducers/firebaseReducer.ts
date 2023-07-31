import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { firebaseReducer as reducer } from "react-redux-firebase"
import { HandRaise } from "types/handraise"

// Optional: You can define the schema of your Firebase Redux store.
// This will give you type-checking for state.firebase.data.livestreams and state.firebase.ordered.livestreams
// THis schema is no longer actively used, but is kept here for legacy reasons, please use hooks instead
type FirebaseSchema = {
   livestreams: LivestreamEvent
   handRaises: HandRaise
}

const firebaseReducer = reducer<{}, FirebaseSchema>

export default firebaseReducer
