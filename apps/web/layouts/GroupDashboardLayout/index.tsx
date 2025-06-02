import { mapFirestoreDocuments } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupOption,
   GroupQuestion,
} from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { GroupStats } from "@careerfairy/shared-lib/groups/stats"
import { CircularProgress, Typography } from "@mui/material"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { useRouter } from "next/router"
import React, {
   createContext,
   FC,
   SetStateAction,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { isEmpty, isLoaded } from "react-redux-firebase"
import { useSessionStorage } from "react-use"
import useAdminGroup from "../../components/custom-hook/useAdminGroup"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import useSnackbarNotifications from "../../components/custom-hook/useSnackbarNotifications"
import { groupRepo } from "../../data/RepositoryInstances"
import GroupsUtil from "../../data/util/GroupsUtil"
import { useAuth } from "../../HOCs/AuthProvider"
import GroupDashboardLayoutProvider from "./GroupDashboardLayoutProvider"
import { useLivestreamDialog } from "./useLivestreamDialog"

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
   questionsLoaded: boolean
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
   questionsLoaded: false,
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
   topBarMobileCta?: React.ReactNode
   topBarNavigation?: React.ReactNode
   bottomBarNavigation?: React.ReactNode
   backgroundColor?: string
}
const GroupDashboardLayout: FC<GroupDashboardLayoutProps> = (props) => {
   const { children, groupId, titleComponent, backgroundColor } = props
   const isMobile = useIsMobile()
   const [groupQuestions, setGroupQuestions] = useState<GroupQuestion[]>([])
   const [questionsLoaded, setQuestionsLoaded] = useState<boolean>(false)

   const { replace, push } = useRouter()
   const pathShouldShrink = usePathShouldShrink()
   const { userData, adminGroups, isLoggedOut } = useAuth()
   const featureFlags = useFeatureFlags()

   const { group, stats } = useAdminGroup(groupId)

   const { data: creators } = useGroupCreators(group?.id)

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

   const shrunkInitialState: shrunkState = pathShouldShrink
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
               setQuestionsLoaded(true)
            }
         )

         return () => {
            setQuestionsLoaded(false)
            setGroupQuestions([])
            unsubscribe()
         }
      }
   }, [groupId, group?.id])

   const groupPresenter = useMemo(() => {
      if (!group) return null

      const presenter = GroupPresenter.createFromDocument(group)
      presenter.setFeatureFlags(featureFlags)
      presenter.setHasMentor(creators?.length > 0)

      return presenter
   }, [creators?.length, featureFlags, group])

   const livestreamDialog = useLivestreamDialog(group)

   const contextValues = useMemo(
      () => ({
         group,
         stats,
         flattenedGroupOptions,
         groupQuestions,
         questionsLoaded,
         groupPresenter,
         role: adminGroups?.[group?.id]?.role,
         livestreamDialog,
         shrunkLeftMenuState,
         shrunkLeftMenuIsActive: shrunkLeftMenuState === "shrunk",
         setShrunkLeftMenuState,
      }),
      [
         group,
         stats,
         flattenedGroupOptions,
         groupQuestions,
         questionsLoaded,
         groupPresenter,
         adminGroups,
         livestreamDialog,
         shrunkLeftMenuState,
         setShrunkLeftMenuState,
      ]
   )

   const loading = Boolean(loadingGroup || !isAdmin || !isCorrectGroup)

   const empty = isEmpty(group)

   return (
      <Outlet empty={empty} loading={loading}>
         <GroupContext.Provider value={contextValues}>
            <GroupDashboardLayoutProvider
               topBarCta={props.topBarCta}
               topBarMobileCta={props.topBarMobileCta}
               topBarNavigation={props.topBarNavigation}
               bottomBarNavigation={props.bottomBarNavigation}
               titleComponent={titleComponent}
               backgroundColor={backgroundColor}
            >
               {children}
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

/**
 * Outlet component is used to conditionally render CircularProgress, Typography, or children based on the loading and empty states.
 * However, due to a specific rendering issue in Safari, CircularProgress was still being rendered even when loading was false.
 * This led to both CircularProgress and the children being rendered at the same time, causing layout shifts.
 *
 * To prevent this layout shift, we use position: "absolute" for CircularProgress. This ensures that even if Safari incorrectly
 * renders CircularProgress, it doesn't affect the layout of the other elements on the page.
 *
 * This is a workaround specifically for Safari and should be revisited if the rendering issue in Safari is resolved in the future.
 */
const Outlet = ({ children, empty, loading }: OutletProps) => {
   if (loading) {
      return <CircularProgress sx={{ margin: "auto", position: "absolute" }} />
   }

   if (empty) {
      return (
         <Typography
            variant={"h6"}
            sx={{ margin: "auto", position: "absolute" }}
         >
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
