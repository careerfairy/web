import { useRouter } from "next/router"
import { ReactElement, ReactNode } from "react"
import { LivestreamAnalyticsNavigationTabs } from "../../components/views/group/admin/analytics-new/live-stream/LivestreamAnalyticsNavigationTabs"
import DashboardHead from "./DashboardHead"
import GroupDashboardLayout from "./index"
import { MobileBottomNavigation } from "./MobileBottomNavigation"
import { SubNavigationTabs } from "./SubNavigationTabs"
import { CreateButton } from "./TopBar/CreateButton"

type GroupDashboardLayoutProps = {
   titleComponent: ReactNode | ((router: any) => ReactNode)
   topBarAction?: ReactNode
   topBarNavigation?: ReactNode
   bottomBarNavigation?: ReactNode
   backgroundColor?: string
   dashboardHeadTitle?: string
   subNavigationFor?: "settings" | "content" | "analytics"
   wrapper?: (children: ReactElement) => ReactElement
}

/**
 * Higher-Order Component that enables Next.js getLayout pattern for admin pages,
 * eliminating layout flicker during navigation while supporting complex context
 * requirements through an optional wrapper parameter.
 */
export const withGroupDashboardLayout = (props: GroupDashboardLayoutProps) => {
   const LayoutWrapper = (page: ReactElement) => {
      const {
         titleComponent,
         topBarAction,
         topBarNavigation,
         bottomBarNavigation,
         backgroundColor,
         dashboardHeadTitle,
         subNavigationFor,
         wrapper,
      } = props

      const router = useRouter()

      const resolvedTitleComponent =
         typeof titleComponent === "function"
            ? titleComponent(router)
            : titleComponent

      // Check if we're on analytics live stream pages
      const isAnalyticsLiveStreamPage = router.pathname.includes(
         "/admin/analytics/live-streams"
      )

      const layoutContent = (
         <GroupDashboardLayout
            titleComponent={resolvedTitleComponent}
            topBarAction={topBarAction || <CreateButton />}
            topBarNavigation={topBarNavigation}
            bottomBarNavigation={
               bottomBarNavigation || <MobileBottomNavigation />
            }
            backgroundColor={backgroundColor}
         >
            {Boolean(dashboardHeadTitle) && (
               <DashboardHead title={dashboardHeadTitle} />
            )}
            {Boolean(subNavigationFor) && (
               <SubNavigationTabs showSubNavigationFor={subNavigationFor} />
            )}
            {Boolean(isAnalyticsLiveStreamPage) && (
               <LivestreamAnalyticsNavigationTabs />
            )}
            {page}
         </GroupDashboardLayout>
      )

      // If a wrapper is provided, wrap the entire layout
      return wrapper ? wrapper(layoutContent) : layoutContent
   }

   LayoutWrapper.displayName = "GroupDashboardLayoutWrapper"
   return LayoutWrapper
}
