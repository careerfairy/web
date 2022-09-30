import React, {
   createContext,
   FC,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import NavBar from "./NavBar"
import { useRouter } from "next/router"
import { useAuth } from "../../HOCs/AuthProvider"
import { isEmpty, isLoaded } from "react-redux-firebase"
import { useSelector } from "react-redux"
import TopBar from "./TopBar"
import useAdminGroup from "../../components/custom-hook/useAdminGroup"
import useDashboardLinks from "../../components/custom-hook/useDashboardLinks"
import { CircularProgress, Typography } from "@mui/material"
import Page, {
   PageChildrenWrapper,
   PageContentWrapper,
} from "../../components/views/common/Page"
import useIsDesktop from "../../components/custom-hook/useIsDesktop"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupOption,
   GroupQuestion,
} from "@careerfairy/shared-lib/dist/groups"
import RootState from "../../store/reducers"
import GroupsUtil from "../../data/util/GroupsUtil"
import { GroupPresenter } from "@careerfairy/shared-lib/dist/groups/GroupPresenter"
import { groupRepo } from "../../data/RepositoryInstances"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import useSnackbarNotifications from "../../components/custom-hook/useSnackbarNotifications"

const styles = {
   childrenWrapperResponsive: {
      width: (theme) => `calc(100% - ${theme.drawerWidth.small})`,
   },
}

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
}
const GroupDashboardLayout: FC<GroupDashboardLayoutProps> = (props) => {
   const { children, groupId } = props
   const scrollRef = useRef(null)
   const [groupQuestions, setGroupQuestions] = useState<GroupQuestion[]>([])

   const isDesktop = useIsDesktop()
   const { replace, push } = useRouter()
   const { userData, adminGroups, isLoggedOut } = useAuth()
   const notifications = useSelector(
      ({ firestore }: RootState) => firestore.ordered.notifications || []
   )

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

   return (
      <GroupContext.Provider value={contextValues}>
         <Page>
            <TopBar notifications={notifications} />
            <PageContentWrapper>
               {isLoaded(group) && !isEmpty(group) && (
                  <NavBar
                     drawerTopLinks={drawerTopLinks}
                     drawerBottomLinks={drawerBottomLinks}
                     headerLinks={headerLinks}
                     group={group}
                     isDesktop={isDesktop}
                  />
               )}
               <PageChildrenWrapper
                  sx={[isDesktop && styles.childrenWrapperResponsive]}
               >
                  {loadingGroup || !isAdmin || !isCorrectGroup ? (
                     <CircularProgress sx={{ margin: "auto" }} />
                  ) : isEmpty(group) ? (
                     <Typography variant={"h6"} sx={{ margin: "auto" }}>
                        Group not found
                     </Typography>
                  ) : (
                     React.Children.map(children, (child) =>
                        // @ts-ignore
                        React.cloneElement(child, {
                           notifications,
                           isAdmin,
                           scrollRef,
                           group,
                           ...props,
                        })
                     )
                  )}
               </PageChildrenWrapper>
            </PageContentWrapper>
         </Page>
      </GroupContext.Provider>
   )
}

export const useGroup = () => useContext<GroupAdminContext>(GroupContext)

export default GroupDashboardLayout
