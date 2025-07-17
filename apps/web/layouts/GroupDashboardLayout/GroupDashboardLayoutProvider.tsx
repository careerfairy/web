import { useAppDispatch, useAppSelector } from "components/custom-hook/store"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Fragment, ReactNode, useCallback, useMemo } from "react"
import ManageCompaniesDialog from "../../components/views/profile/my-groups/ManageCompaniesDialog"
import {
   closeManageCompaniesDialog,
   openManageCompaniesDialog,
   setLeftDrawer,
   setMobileFullScreenMenu,
   setMobileProfileDrawer,
   toggleLeftDrawer,
   toggleMobileFullScreenMenu,
   toggleMobileProfileDrawer,
} from "../../store/reducers/groupDashboardLayoutReducer"
import AdminGenericLayout from "../AdminGenericLayout"
import NavBar from "./NavBar"
import TopBar from "./TopBar"

type IGroupDashboardContext = {
   setLeftDrawer: (open: boolean) => void
   toggleLeftDrawer: () => void
   setMobileProfileDrawer: (open: boolean) => void
   toggleMobileProfileDrawer: () => void
   setMobileFullScreenMenu: (open: boolean) => void
   toggleMobileFullScreenMenu: () => void
   openManageCompaniesDialog: () => void
   closeManageCompaniesDialog: () => void
}

export const useGroupDashboard = (): IGroupDashboardContext => {
   const dispatch = useAppDispatch()

   return useMemo(
      () => ({
         /**
          * Toggle the visibility of the left drawer in the group dashboard layout.
          */
         toggleLeftDrawer: () => dispatch(toggleLeftDrawer()),

         /**
          * Set the open state of the left drawer.
          * @param open - Whether the left drawer should be open.
          */
         setLeftDrawer: (open: boolean) => dispatch(setLeftDrawer(open)),

         /**
          * Set the open state of the mobile profile drawer.
          * @param open - Whether the mobile profile drawer should be open.
          */
         setMobileProfileDrawer: (open: boolean) =>
            dispatch(setMobileProfileDrawer(open)),

         /**
          * Toggle the visibility of the mobile profile drawer.
          */
         toggleMobileProfileDrawer: () => dispatch(toggleMobileProfileDrawer()),

         /**
          * Set the open state of the mobile full screen menu.
          * @param open - Whether the mobile full screen menu should be open.
          */
         setMobileFullScreenMenu: (open: boolean) =>
            dispatch(setMobileFullScreenMenu(open)),

         /**
          * Toggle the visibility of the mobile full screen menu.
          */
         toggleMobileFullScreenMenu: () =>
            dispatch(toggleMobileFullScreenMenu()),

         /**
          * Open the manage companies dialog.
          */
         openManageCompaniesDialog: () => dispatch(openManageCompaniesDialog()),

         /**
          * Close the manage companies dialog.
          */
         closeManageCompaniesDialog: () =>
            dispatch(closeManageCompaniesDialog()),
      }),
      [dispatch]
   )
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
   const dispatch = useAppDispatch()

   const leftDrawerOpen = useAppSelector(
      (state) => state.groupDashboardLayout.layout.leftDrawerOpen
   )
   const manageCompaniesDialogOpen = useAppSelector(
      (state) => state.groupDashboardLayout.manageCompaniesDialogOpen
   )

   const isMobile = useIsMobile()

   const handleSetLeftDrawer = useCallback(
      (open: boolean) => dispatch(setLeftDrawer(open)),
      [dispatch]
   )

   const handleToggleLeftDrawer = useCallback(
      () => dispatch(toggleLeftDrawer()),
      [dispatch]
   )

   return (
      <Fragment>
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
            drawerOpen={leftDrawerOpen}
            setDrawer={handleSetLeftDrawer}
            toggleDrawer={handleToggleLeftDrawer}
         >
            {children}
         </AdminGenericLayout>

         {/* Manage Companies Dialog */}
         <ManageCompaniesDialog
            open={manageCompaniesDialogOpen}
            handleClose={() => dispatch(closeManageCompaniesDialog())}
         />
      </Fragment>
   )
}

export default GroupDashboardLayoutProvider
