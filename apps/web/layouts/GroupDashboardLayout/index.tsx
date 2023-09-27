import React, {
   createContext,
   FC,
   SetStateAction,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useRouter } from "next/router"
import { useAuth } from "../../HOCs/AuthProvider"
import { isEmpty, isLoaded } from "react-redux-firebase"
import useAdminGroup from "../../components/custom-hook/useAdminGroup"
import { CircularProgress, Typography } from "@mui/material"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupOption,
   GroupQuestion,
} from "@careerfairy/shared-lib/groups"
import GroupsUtil from "../../data/util/GroupsUtil"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { groupRepo } from "../../data/RepositoryInstances"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import useSnackbarNotifications from "../../components/custom-hook/useSnackbarNotifications"
import GroupDashboardLayoutProvider from "./GroupDashboardLayoutProvider"
import { GroupStats } from "@careerfairy/shared-lib/groups/stats"
import { useLivestreamDialog } from "./useLivestreamDialog"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import { useSessionStorage } from "react-use"

/**
 * The shrunk state of the left menu
 * disabled: The current page doesn't need shrinking
 * open: The left menu is open (fully expanded)
 * shrunk: The left menu is shrunk
 */
export type shrunkState = "disabled" | "open" | "shrunk"

type GroupAdminContext = {
   group: Group
   stats: GroupStats
   flattenedGroupOptions: GroupOption[]
   groupQuestions: GroupQuestion[]
   groupPresenter?: GroupPresenter
   role: GROUP_DASHBOARD_ROLE
   livestreamDialog: ReturnType<typeof useLivestreamDialog>
   shrunkLeftMenuState: shrunkState
   shrunkLeftMenuIsActive: boolean
   setShrunkLeftMenuState: React.Dispatch<SetStateAction<shrunkState>>
}

const GroupContext = createContext<GroupAdminContext>({
   group: null,
   stats: null,
   flattenedGroupOptions: [],
   groupQuestions: [],
   groupPresenter: undefined,
   role: undefined,
   livestreamDialog: undefined,
   shrunkLeftMenuState: "disabled",
   shrunkLeftMenuIsActive: false,
   setShrunkLeftMenuState: () => {},
})

type GroupDashboardLayoutProps = {
   groupId: string
   titleComponent: React.ReactNode
   children: React.ReactNode
   topBarCta?: React.ReactNode
}
const GroupDashboardLayout: FC<GroupDashboardLayoutProps> = (props) => {
   const { children, groupId, titleComponent } = props
   const isMobile = useIsMobile()
   const [groupQuestions, setGroupQuestions] = useState<GroupQuestion[]>([])

   const { replace, push, pathname } = useRouter()
   const pathShouldShrink = usePathShouldShrink()
   const { userData, adminGroups, isLoggedOut } = useAuth()

   const { group, stats } = useAdminGroup(groupId)

   const { errorNotification } = useSnackbarNotifications()

   const groupDoesNotExist = isLoaded(group) && isEmpty(group)

   const flattenedGroupOptions = useMemo<GroupOption[]>(() => {
      return group ? GroupsUtil.handleFlattenOptions(group) : []
   }, [group])

   const isAdmin = useMemo(
      () => userData?.isAdmin || adminGroups[group?.id],
      [userData?.isAdmin, adminGroups, group?.id]
   )

   const loadingGroup = !isLoaded(group) || !isLoaded(stats)

   const isCorrectGroup = groupId === group?.id

   let shrunkInitialState: shrunkState = pathShouldShrink
      ? "shrunk"
      : "disabled"
   const [shrunkLeftMenuState, setShrunkLeftMenuState] =
      useSessionStorage<shrunkState>("shrunkLeftMenuState", shrunkInitialState)

   // on mobile, we don't want to shrunk the left menu
   useEffect(() => {
      if (isMobile) {
         setShrunkLeftMenuState("disabled")
      } else {
         if (
            shrunkInitialState !== "disabled" &&
            shrunkLeftMenuState === "disabled"
         ) {
            // reset user state if some page activates the shrinking
            setShrunkLeftMenuState(shrunkInitialState)
         }
      }
   }, [
      isMobile,
      setShrunkLeftMenuState,
      shrunkInitialState,
      shrunkLeftMenuState,
   ])

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

   const livestreamDialog = useLivestreamDialog(group)

   const contextValues = useMemo(
      () => ({
         group,
         stats,
         flattenedGroupOptions,
         groupQuestions,
         groupPresenter,
         role: adminGroups?.[group?.id]?.role,
         livestreamDialog,
         shrunkLeftMenuState,
         shrunkLeftMenuIsActive: shrunkLeftMenuState === "shrunk",
         setShrunkLeftMenuState,
      }),
      [
         adminGroups,
         flattenedGroupOptions,
         group,
         groupPresenter,
         groupQuestions,
         livestreamDialog,
         shrunkLeftMenuState,
         setShrunkLeftMenuState,
         stats,
      ]
   )

   const loading = Boolean(loadingGroup || !isAdmin || !isCorrectGroup)

   const empty = isEmpty(group)

   return (
      <Outlet empty={empty} loading={loading}>
         <GroupContext.Provider value={contextValues}>
            <GroupDashboardLayoutProvider
               topBarCta={props.topBarCta}
               titleComponent={titleComponent}
            >
               {children}
               {livestreamDialog.StreamCreationDialog}
            </GroupDashboardLayoutProvider>
         </GroupContext.Provider>
      </Outlet>
   )
}

/**
 * Paths that should have the shrunk left menu functionality
 */
const pathsThatShouldShrink = [
   "/group/[groupId]/admin/livestream/[[...livestreamId]]",
]

const usePathShouldShrink = () => {
   const { pathname } = useRouter()

   return useMemo(() => {
      return pathsThatShouldShrink.some((path) => path === pathname)
   }, [pathname])
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

export const useGroup = () => {
   const context = useContext(GroupContext)
   if (context === undefined) {
      throw new Error("useGroup must be used within a GroupAdminContext")
   }
   return context
}

export default GroupDashboardLayout
