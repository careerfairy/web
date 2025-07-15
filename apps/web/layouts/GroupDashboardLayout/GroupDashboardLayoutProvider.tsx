import useIsMobile from "components/custom-hook/useIsMobile"
import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useMemo,
   useReducer,
} from "react"
import AdminGenericLayout from "../AdminGenericLayout"
import NavBar from "./NavBar"
import TopBar from "./TopBar"

type IGroupDashboardState = {
   layout: {
      leftDrawerOpen: boolean
      mobileProfileDrawerOpen: boolean
      mobileFullScreenMenuOpen: boolean
   }
}

const initialState: IGroupDashboardState = {
   layout: {
      leftDrawerOpen: true,
      mobileProfileDrawerOpen: false,
      mobileFullScreenMenuOpen: false,
   },
}

type IGroupDashboardContext = {
   layout: {
      leftDrawerOpen: boolean
      mobileProfileDrawerOpen: boolean
      mobileFullScreenMenuOpen: boolean
   }
   setLeftDrawer: (open: boolean) => void
   toggleLeftDrawer: () => void
   setMobileProfileDrawer: (open: boolean) => void
   toggleMobileProfileDrawer: () => void
   setMobileFullScreenMenu: (open: boolean) => void
   toggleMobileFullScreenMenu: () => void
}

const GroupDashboardContext = createContext<IGroupDashboardContext>({
   layout: {
      leftDrawerOpen: true,
      mobileProfileDrawerOpen: false,
      mobileFullScreenMenuOpen: false,
   },
   toggleLeftDrawer: () => {},
   setLeftDrawer: () => {},
   setMobileProfileDrawer: () => {},
   toggleMobileProfileDrawer: () => {},
   setMobileFullScreenMenu: () => {},
   toggleMobileFullScreenMenu: () => {},
})

type Action = {
   type:
      | "SET_LAYOUT"
      | "TOGGLE_LAYOUT"
      | "SET_MOBILE_PROFILE_DRAWER"
      | "TOGGLE_MOBILE_PROFILE_DRAWER"
      | "SET_MOBILE_FULLSCREEN_MENU"
      | "TOGGLE_MOBILE_FULLSCREEN_MENU"
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
      case "SET_MOBILE_PROFILE_DRAWER":
         return {
            ...state,
            layout: {
               ...state.layout,
               mobileProfileDrawerOpen: action.payload,
            },
         }
      case "TOGGLE_MOBILE_PROFILE_DRAWER":
         return {
            ...state,
            layout: {
               ...state.layout,
               mobileProfileDrawerOpen: !state.layout.mobileProfileDrawerOpen,
            },
         }
      case "SET_MOBILE_FULLSCREEN_MENU":
         return {
            ...state,
            layout: {
               ...state.layout,
               mobileFullScreenMenuOpen: action.payload,
            },
         }
      case "TOGGLE_MOBILE_FULLSCREEN_MENU":
         return {
            ...state,
            layout: {
               ...state.layout,
               mobileFullScreenMenuOpen: !state.layout.mobileFullScreenMenuOpen,
            },
         }
      default:
         return state
   }
}

type Props = {
   children: ReactNode
   titleComponent: ReactNode
   topBarAction?: ReactNode
   topBarNavigation?: ReactNode
   bottomBarNavigation?: ReactNode
   backgroundColor?: string
}

/**
 * Provides the Group Admin layout state
 *
 * @param children
 * @param pageDisplayName
 * @constructor
 */
const GroupDashboardLayoutProvider = ({
   children,
   titleComponent,
   topBarAction,
   topBarNavigation,
   bottomBarNavigation,
   backgroundColor,
}: Props) => {
   const [state, dispatch] = useReducer(reducer, initialState)
   const isMobile = useIsMobile()

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

   const setMobileProfileDrawer = useCallback(
      (open: boolean) =>
         dispatch({
            type: "SET_MOBILE_PROFILE_DRAWER",
            payload: open,
         }),
      [dispatch]
   )

   const toggleMobileProfileDrawer = useCallback(
      () =>
         dispatch({
            type: "TOGGLE_MOBILE_PROFILE_DRAWER",
         }),
      [dispatch]
   )

   const setMobileFullScreenMenu = useCallback(
      (open: boolean) =>
         dispatch({
            type: "SET_MOBILE_FULLSCREEN_MENU",
            payload: open,
         }),
      [dispatch]
   )

   const toggleMobileFullScreenMenu = useCallback(
      () =>
         dispatch({
            type: "TOGGLE_MOBILE_FULLSCREEN_MENU",
         }),
      [dispatch]
   )

   const value = useMemo<IGroupDashboardContext>(
      () => ({
         toggleLeftDrawer,
         setLeftDrawer,
         setMobileProfileDrawer,
         toggleMobileProfileDrawer,
         setMobileFullScreenMenu,
         toggleMobileFullScreenMenu,
         layout: state.layout,
      }),
      [
         toggleLeftDrawer,
         setLeftDrawer,
         setMobileProfileDrawer,
         toggleMobileProfileDrawer,
         setMobileFullScreenMenu,
         toggleMobileFullScreenMenu,
         state.layout,
      ]
   )

   return (
      <GroupDashboardContext.Provider value={value}>
         <AdminGenericLayout
            bgColor={backgroundColor ?? "#F7F8FC"}
            headerContent={
               <TopBar
                  topBarAction={topBarAction}
                  navigation={topBarNavigation}
                  title={titleComponent}
               />
            }
            hideDrawer={isMobile}
            showBottomNavContent
            bottomNavContent={bottomBarNavigation}
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
