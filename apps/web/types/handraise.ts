import { Identifiable } from "./commonTypes"
import firebase from "firebase/compat/app"
import Timestamp = firebase.firestore.Timestamp

export enum HandRaiseState {
   /**
    * This should be the first step/state in the hand raise process.
    * As long as this state is active, the user should have the media device selection modal open
    */
   acquire_media = "acquire_media",
   /**
    * User has sent a request to the hosts for a hand raise, make sure this comes after a successful acquire_media
    * to ensure the hand raise process goes as smooth as possible
    */
   requested = "requested",
   /**
    * This state signifies that the streamer has seen the "requested" hand raise and clicked invite
    * The invite process should trigger a useEffect for the hand raiser to immediately/automatically start the "connecting" phase
    */
   invited = "invited",
   /**
    * This state signifies that the hand raiser is in the process of connecting to the stream as a host
    */
   connecting = "connecting",
   /**
    * This state signifies that the hand raiser has successfully joined the stream as a host.
    * Note: If the hand raiser leaves the returns/refreshes the streaming page and there is still room
    * they will immediately enter the "connecting" phase for a smooth user experience
    */
   connected = "connected",
   /**
    * This state signifies that the user has either declined/left hand raise or
    * the host has removed them
    */
   unrequested = "unrequested",
   /**
    * Hand raise has been removed/rejected
    */
   denied = "denied",
}
export interface HandRaise extends Identifiable {
   name: string
   state: HandRaiseState
   timeStamp: Timestamp
   date?: Date
}
