import { Speaker } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { useAppDispatch } from "components/custom-hook/store"
import {
   ReactNode,
   createContext,
   useContext,
   useMemo,
   useReducer,
} from "react"
import { usePrevious } from "react-use"
import { setSpeakerId, setUserUid } from "store/reducers/streamingAppReducer"

export enum ProfileSelectEnum {
   SELECT_SPEAKER,
   EDIT_SPEAKER,
   CREATE_SPEAKER,
   JOIN_WITH_SPEAKER,
}

type State = {
   selectedSpeaker: Speaker | null
   activeView: ProfileSelectEnum
}

type Action =
   | { type: ProfileSelectEnum.SELECT_SPEAKER }
   | { type: ProfileSelectEnum.JOIN_WITH_SPEAKER; payload: Speaker }
   | { type: ProfileSelectEnum.EDIT_SPEAKER; payload: Speaker }
   | { type: ProfileSelectEnum.CREATE_SPEAKER }
   | { type: "SELECT_USER"; payload: UserData }
   | { type: "RESET" }

const reducer = (state: State, action: Action): State => {
   switch (action.type) {
      case ProfileSelectEnum.SELECT_SPEAKER:
         return {
            ...state,
            activeView: ProfileSelectEnum.SELECT_SPEAKER,
         }
      case ProfileSelectEnum.JOIN_WITH_SPEAKER:
         return {
            ...state,
            selectedSpeaker: action.payload,
            activeView: ProfileSelectEnum.JOIN_WITH_SPEAKER,
         }
      case ProfileSelectEnum.EDIT_SPEAKER:
         return {
            ...state,
            selectedSpeaker: action.payload,
            activeView: ProfileSelectEnum.EDIT_SPEAKER,
         }
      case ProfileSelectEnum.CREATE_SPEAKER:
         return {
            ...state,
            selectedSpeaker: null,
            activeView: ProfileSelectEnum.CREATE_SPEAKER,
         }
      case "RESET":
         return {
            selectedSpeaker: null,
            activeView: ProfileSelectEnum.SELECT_SPEAKER,
         }
      default:
         return state
   }
}

type ProfileSelectContextType = {
   joinLiveStreamWithSpeaker: (speakerId: string) => void
   joinLiveStreamWithUser: (userId: string) => void
   goBackToSelectSpeaker: () => void
   editSpeaker: (speaker: Speaker) => void
   selectSpeaker: (speaker: Speaker) => void
   selectedSpeaker: Speaker | null
   activeView: ProfileSelectEnum
   prevActiveView: ProfileSelectEnum | null
}

const ProfileSelectContext = createContext<
   ProfileSelectContextType | undefined
>(undefined)

type Props = {
   children: (activeView: ProfileSelectEnum) => ReactNode
}

export const ProfileSelectProvider = ({ children }: Props) => {
   const appDispatch = useAppDispatch()

   const [state, dispatch] = useReducer(reducer, {
      selectedSpeaker: null,
      activeView: ProfileSelectEnum.SELECT_SPEAKER,
   })

   const prevActiveView = usePrevious(state.activeView)

   const value = useMemo<ProfileSelectContextType>(
      () => ({
         activeView: state.activeView,
         prevActiveView: prevActiveView,
         selectedSpeaker: state.selectedSpeaker,
         editSpeaker: (speaker: Speaker) => {
            return dispatch({
               type: ProfileSelectEnum.EDIT_SPEAKER,
               payload: speaker,
            })
         },
         selectSpeaker: (speaker: Speaker) => {
            return dispatch({
               type: ProfileSelectEnum.JOIN_WITH_SPEAKER,
               payload: speaker,
            })
         },
         goBackToSelectSpeaker: () => {
            return dispatch({ type: ProfileSelectEnum.SELECT_SPEAKER })
         },
         joinLiveStreamWithSpeaker: (speakerId: string) => {
            dispatch({ type: "RESET" })
            return appDispatch(setSpeakerId(speakerId))
         },
         joinLiveStreamWithUser: (userId: string) => {
            dispatch({ type: "RESET" })
            return appDispatch(setUserUid(userId))
         },
      }),
      [state, dispatch, appDispatch, prevActiveView]
   )

   return (
      <ProfileSelectContext.Provider value={value}>
         {children(state.activeView)}
      </ProfileSelectContext.Provider>
   )
}

export const useHostProfileSelection = () => {
   const context = useContext(ProfileSelectContext)
   if (!context) {
      throw new Error(
         "useHostProfileSelection must be used within a ProfileSelectProvider"
      )
   }
   return context
}
