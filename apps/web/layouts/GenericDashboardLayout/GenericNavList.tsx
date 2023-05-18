import NavList from "../common/NavList"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import BottomNavBar from "./BottomNavBar"
import { useGenericDashboard } from "./index"

const GenericNavList = () => {
   const isMobile = useIsMobile()
   const { navLinks } = useGenericDashboard()

   return isMobile ? (
      <BottomNavBar links={navLinks} />
   ) : (
      <NavList links={navLinks} />
   )
}

export default GenericNavList
