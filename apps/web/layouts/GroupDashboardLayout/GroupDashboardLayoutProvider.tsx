import React, {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useMemo,
   useReducer,
} from "react"
import TopBar from "./TopBar"
import AdminGenericLayout from "../AdminGenericLayout"
import NavBar from "./NavBar"

type IGroupDashboardState = {
   layout: {
      leftDrawerOpen: boolean
   }
}

const initialState: IGroupDashboardState = {
   layout: {
      leftDrawerOpen: true,
   },
}

type IGroupDashboardContext = {
   layout: {
      leftDrawerOpen: boolean
   }
   setLeftDrawer: (open: boolean) => void
   toggleLeftDrawer: () => void
}

const GroupDashboardContext = createContext<IGroupDashboardContext>({
   layout: {
      leftDrawerOpen: true,
   },
   toggleLeftDrawer: () => {},
   setLeftDrawer: () => {},
})

type Action = {
   type: "SET_LAYOUT" | "TOGGLE_LAYOUT"
   payload?: boolean
}

const reducer = (state: IGroupDashboardState, action: Action) => {
   switch (action.type) {
      case "SET_LAYOUT":
         return {
            ...state,
            layout: {
               ...state.layout,
               leftDrawerOpen: action.payload,
            },
         }
      case "TOGGLE_LAYOUT":
         return {
            ...state,
            layout: {
               ...state.layout,
               leftDrawerOpen: !state.layout.leftDrawerOpen,
            },
         }
      default:
         return state
   }
}

type Props = {
   children: ReactNode
   pageDisplayName: string
}

/**
 * Provides the Group Admin layout state
 *
 * @param children
 * @param pageDisplayName
 * @constructor
 */
const GroupDashboardLayoutProvider = ({ children, pageDisplayName }: Props) => {
   const [state, dispatch] = useReducer(reducer, initialState)

   const toggleLeftDrawer = useCallback(
      () =>
         dispatch({
            type: "TOGGLE_LAYOUT",
         }),
      [dispatch]
   )

   const setLeftDrawer = useCallback(
      (open: boolean) =>
         dispatch({
            type: "SET_LAYOUT",
            payload: open,
         }),
      [dispatch]
   )

   const value = useMemo<IGroupDashboardContext>(
      () => ({
         toggleLeftDrawer,
         setLeftDrawer,
         layout: state.layout,
      }),
      [toggleLeftDrawer, setLeftDrawer, state.layout]
   )

   return (
      <GroupDashboardContext.Provider value={value}>
         <AdminGenericLayout
            bgColor="#F7F8FC"
            headerContent={<TopBar title={pageDisplayName} />}
            drawerContent={<NavBar />}
            drawerOpen={state.layout.leftDrawerOpen}
            setDrawer={setLeftDrawer}
            toggleDrawer={toggleLeftDrawer}
         >
            {children}
         </AdminGenericLayout>
      </GroupDashboardContext.Provider>
   )
}

export const useGroupDashboard = () => {
   const context = useContext(GroupDashboardContext)
   if (context === undefined) {
      throw new Error(
         "useGroupDashboard must be used within a GroupDashboardContextProvider"
      )
   }
   return context
}
export default GroupDashboardLayoutProvider
