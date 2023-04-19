import NavBar from "./NavBar"
import AdminGenericLayout from "../AdminGenericLayout"
import TopBar from "./TopBar"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import GenericNavList from "./GenericNavList"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import useScrollTrigger from "@mui/material/useScrollTrigger"

type IGenericDashboardContext = {
   isOverBanner: boolean
   isPortalPage: boolean
   hasRecordings: boolean
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isOverBanner: false,
   isPortalPage: false,
   hasRecordings: false,
})

type Props = {
   children: JSX.Element
   pageDisplayName: string
   bgColor?: string
   hasRecordings?: boolean
}

const GenericDashboardLayout = ({
   children,
   pageDisplayName,
   bgColor,
   hasRecordings,
}: Props) => {
   const isMobile = useIsMobile()
   const { pathname } = useRouter()
   const isPortalPage = useMemo(() => pathname === "/portal", [pathname])
   const isScrollingHoverTheBanner = useScrollTrigger({
      threshold: 250,
      disableHysteresis: true,
   })

   // TODO: Needs to be updated after the new banner.
   //  Banner will be prominent on the Portal page so no need to validate if there's any recordings

   // To have a different look & feel on header and topBar when hovering the portal page banner
   const [isOverBanner, setIsOverBanner] = useState<boolean>(
      isPortalPage && hasRecordings
   )

   useEffect(() => {
      if (isPortalPage && hasRecordings) {
         setIsOverBanner(!isScrollingHoverTheBanner)
      }
   }, [isScrollingHoverTheBanner])

   const value = useMemo<IGenericDashboardContext>(
      () => ({ isOverBanner, isPortalPage, hasRecordings }),
      [hasRecordings, isOverBanner, isPortalPage]
   )

   return (
      <GenericDashboardContext.Provider value={value}>
         <AdminGenericLayout
            bgColor={bgColor || "#F7F8FC"}
            headerContent={<TopBar title={pageDisplayName} />}
            drawerContent={<NavBar />}
            bottomNavContent={<GenericNavList />}
            drawerOpen={!isMobile}
         >
            {children}
         </AdminGenericLayout>
      </GenericDashboardContext.Provider>
   )
}

export const useGenericDashboard = () => useContext(GenericDashboardContext)

export default GenericDashboardLayout
