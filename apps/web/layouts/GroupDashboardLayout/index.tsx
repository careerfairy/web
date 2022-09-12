import React, {
   createContext,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react"
import NavBar from "./NavBar"
import { useRouter } from "next/router"
import { useFirebaseService } from "../../context/firebase/FirebaseServiceContext"
import { useAuth } from "../../HOCs/AuthProvider"
import { isEmpty, isLoaded } from "react-redux-firebase"
import { useSelector } from "react-redux"
import TopBar from "./TopBar"
import useDashboardRedirect from "../../components/custom-hook/useDashboardRedirect"
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
   GroupOption,
   GroupQuestion,
} from "@careerfairy/shared-lib/dist/groups"
import RootState from "../../store/reducers"
import GroupsUtil from "../../data/util/GroupsUtil"
import { GroupPresenter } from "@careerfairy/shared-lib/dist/groups/GroupPresenter"
import { groupRepo } from "../../data/RepositoryInstances"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

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
}

const GroupContext = createContext<GroupAdminContext>({
   group: null,
   flattenedGroupOptions: [],
   groupQuestions: [],
   groupPresenter: undefined,
})

const GroupDashboardLayout = (props) => {
   const firebase = useFirebaseService()
   const { children } = props
   const scrollRef = useRef(null)
   const [groupQuestions, setGroupQuestions] = useState<GroupQuestion[]>([])

   const isDesktop = useIsDesktop()
   const {
      query: { groupId },
   } = useRouter()
   const { userData, authenticatedUser, isLoggedIn } = useAuth()
   const notifications = useSelector(
      ({ firestore }: RootState) => firestore.ordered.notifications || []
   )

   const group = useAdminGroup(groupId)
   useDashboardRedirect(group, firebase)

   const flattenedGroupOptions = useMemo<GroupOption[]>(() => {
      return group ? GroupsUtil.handleFlattenOptions(group) : []
   }, [group])
   const { headerLinks, drawerTopLinks, drawerBottomLinks } =
      useDashboardLinks(group)

   const isAdmin = useMemo(
      () =>
         userData?.isAdmin ||
         group?.adminEmails?.includes(authenticatedUser?.email),
      [userData?.isAdmin, group?.adminEmails, authenticatedUser?.email]
   )
   const isCorrectGroup = useMemo(
      () => groupId === group?.groupId,
      [groupId, group?.groupId]
   )

   useEffect(() => {
      if (isCorrectGroup && group?.id) {
         const unsubscribe = groupRepo.listenToGroupQuestions(
            group.id,
            (categories) => {
               setGroupQuestions(mapFirestoreDocuments(categories) || [])
            }
         )

         return () => {
            unsubscribe()
            setGroupQuestions([])
         }
      }
   }, [isCorrectGroup, groupId, group.id])

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
      }),
      [flattenedGroupOptions, group, groupPresenter, groupQuestions]
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
                  {!isLoaded(group) || !isLoggedIn ? (
                     <CircularProgress sx={{ margin: "auto" }} />
                  ) : isEmpty(group) || !isCorrectGroup ? (
                     <Typography variant={"h6"} sx={{ margin: "auto" }}>
                        Group not found
                     </Typography>
                  ) : (
                     React.Children.map(children, (child) =>
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
