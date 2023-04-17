import NavBar from "./NavBar"
import AdminGenericLayout from "../AdminGenericLayout"
import TopBar from "./TopBar"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import GenericNavList from "./GenericNavList"
import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useRouter } from "next/router"

type IGenericDashboardContext = {
   isOverBanner: boolean
   isPortalPage: boolean
   hasRecordings: boolean
}

const GenericDashboardContext = createContext<IGenericDashboardContext>({
   isOverBanner: true,
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

   const [isOverBanner, setIsOverBanner] = useState<boolean>(
      isPortalPage && hasRecordings
   )

   const checkIfItsOverBanner = useCallback(() => {
      if (!hasRecordings) {
         return
      }
      if (isOverBanner && window.scrollY > 250) {
         setIsOverBanner(false)
      }
      if (!isOverBanner && window.scrollY < 250) {
         setIsOverBanner(true)
      }
   }, [hasRecordings, isOverBanner])

   useEffect(() => {
      if (isPortalPage) {
         window.addEventListener("scroll", checkIfItsOverBanner)
      }

      return () => {
         window.removeEventListener("scroll", checkIfItsOverBanner)
      }
   }, [checkIfItsOverBanner, isPortalPage])

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
