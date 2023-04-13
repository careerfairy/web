import NavBar from "./NavBar"
import AdminGenericLayout from "../AdminGenericLayout"
import TopBar from "./TopBar"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import GenericNavList from "./GenericNavList"

type Props = {
   children: JSX.Element
   pageDisplayName: string
   bgColor?: string
}

const GenericDashboardLayout = ({
   children,
   pageDisplayName,
   bgColor,
}: Props) => {
   const isMobile = useIsMobile()
   return (
      <AdminGenericLayout
         bgColor={bgColor ? bgColor : "#F7F8FC"}
         headerContent={<TopBar title={pageDisplayName} />}
         drawerContent={<NavBar />}
         bottomNavContent={<GenericNavList />}
         drawerOpen={!isMobile}
      >
         {children}
      </AdminGenericLayout>
   )
}

export default GenericDashboardLayout
