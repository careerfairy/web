import React, {
   createContext,
   FC,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import NavBar from "./NavBar"
import { useRouter } from "next/router"
import { useAuth } from "../../HOCs/AuthProvider"
import { isEmpty, isLoaded } from "react-redux-firebase"
import { useDispatch, useSelector } from "react-redux"
import useAdminGroup from "../../components/custom-hook/useAdminGroup"
import useDashboardLinks from "../../components/custom-hook/useDashboardLinks"
import { CircularProgress, Typography } from "@mui/material"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupOption,
   GroupQuestion,
} from "@careerfairy/shared-lib/dist/groups"
import GroupsUtil from "../../data/util/GroupsUtil"
import { GroupPresenter } from "@careerfairy/shared-lib/dist/groups/GroupPresenter"
import { groupRepo } from "../../data/RepositoryInstances"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import useSnackbarNotifications from "../../components/custom-hook/useSnackbarNotifications"
import { leftMenuSelector } from "../../store/selectors/groupDashboardSelectors"
import * as actions from "../../store/actions"
import GenericLayout from "../GenericLayout"
import TopBar from "./TopBar"

type GroupAdminContext = {
   group: Group
   flattenedGroupOptions: GroupOption[]
   groupQuestions: GroupQuestion[]
   groupPresenter?: GroupPresenter
   role: GROUP_DASHBOARD_ROLE
}

const GroupContext = createContext<GroupAdminContext>({
   group: null,
   flattenedGroupOptions: [],
   groupQuestions: [],
   groupPresenter: undefined,
   role: undefined,
})

type GroupDashboardLayoutProps = {
   groupId: string
   pageDisplayName: string
   children: React.ReactNode
}
const GroupDashboardLayout: FC<GroupDashboardLayoutProps> = (props) => {
   const { children, groupId, pageDisplayName } = props
   const [groupQuestions, setGroupQuestions] = useState<GroupQuestion[]>([])

   const dispatch = useDispatch()

   const { replace, push } = useRouter()
   const { userData, adminGroups, isLoggedOut } = useAuth()

   const group = useAdminGroup(groupId)

   const { errorNotification } = useSnackbarNotifications()

   const groupDoesNotExist = isLoaded(group) && isEmpty(group)

   const flattenedGroupOptions = useMemo<GroupOption[]>(() => {
      return group ? GroupsUtil.handleFlattenOptions(group) : []
   }, [group])
   const { headerLinks, drawerTopLinks, drawerBottomLinks } =
      useDashboardLinks(group)

   const isAdmin = useMemo(
      () => userData?.isAdmin || adminGroups[group?.id],
      [userData?.isAdmin, adminGroups, group?.id]
   )

   const loadingGroup = !isLoaded(group)

   const isCorrectGroup = groupId === group?.id

   useEffect(() => {
      if (
         !userData ||
         !isLoaded(group) ||
         !adminGroups ||
         isLoggedOut // We don't want to redirect here if the user is logged out in order to avoid a race condition with the auth provider(it already handles this)
      )
         return

      if (groupDoesNotExist) {
         push("/").then(() => {
            errorNotification("The page you tried to visit is invalid")
         })
      }

      if (userData.isAdmin || adminGroups[group.id]) return

      // At this point, the user is not an admin of the group, so we redirect out of here
      push("/").then(() => {
         errorNotification("You are not authorized to view this page")
      })
   }, [
      adminGroups,
      errorNotification,
      group,
      groupDoesNotExist,
      replace,
      push,
      userData?.isAdmin,
      userData,
      isLoggedOut,
   ])

   useEffect(() => {
      if (group?.id) {
         const unsubscribe = groupRepo.listenToGroupQuestions(
            group.id,
            (categories) => {
               setGroupQuestions(mapFirestoreDocuments(categories) || [])
            }
         )

         return () => {
            unsubscribe()
         }
      }
   }, [groupId, group?.id])

   const groupPresenter = useMemo(
      () => group && GroupPresenter.createFromDocument(group),
      [group]
   )

   const contextValues = useMemo(
      () => ({
         group,
         flattenedGroupOptions,
         groupQuestions,
         groupPresenter,
         role: adminGroups?.[group?.id]?.role,
      }),
      [
         adminGroups,
         flattenedGroupOptions,
         group,
         groupPresenter,
         groupQuestions,
      ]
   )

   // Handle left drawer
   const leftDrawerOpened = useSelector(leftMenuSelector)

   const setDrawer = useCallback(
      (open: boolean) => {
         dispatch(actions.setGroupDashboardDrawer(open))
      },
      [dispatch]
   )

   const handleLeftDrawerToggle = useCallback(() => {
      setDrawer(!leftDrawerOpened)
   }, [leftDrawerOpened, setDrawer])

   const loading = Boolean(loadingGroup || !isAdmin || !isCorrectGroup)

   const empty = isEmpty(group)

   return (
      <GroupContext.Provider value={contextValues}>
         <GenericLayout
            headerContent={
               <TopBar
                  title={pageDisplayName}
                  drawerOpened={leftDrawerOpened}
                  handleLeftDrawerToggle={handleLeftDrawerToggle}
               />
            }
            drawerContent={
               <NavBar
                  drawerTopLinks={drawerTopLinks}
                  drawerBottomLinks={drawerBottomLinks}
                  headerLinks={headerLinks}
                  group={group}
               />
            }
            drawerOpen={leftDrawerOpened}
            setDrawer={setDrawer}
            toggleDrawer={handleLeftDrawerToggle}
         >
            <Outlet empty={empty} loading={loading}>
               {children}
            </Outlet>
         </GenericLayout>
      </GroupContext.Provider>
   )
}

type OutletProps = {
   children: React.ReactNode
   loading?: boolean
   empty?: boolean
}
const Outlet = ({ children, empty, loading }: OutletProps) => {
   if (loading) {
      return <CircularProgress sx={{ margin: "auto" }} />
   }

   if (empty) {
      return (
         <Typography variant={"h6"} sx={{ margin: "auto" }}>
            Group not found
         </Typography>
      )
   }

   return <>{children}</>
}

export const useGroup = () => useContext<GroupAdminContext>(GroupContext)

export default GroupDashboardLayout
