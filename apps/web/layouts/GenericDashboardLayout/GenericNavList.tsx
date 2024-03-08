import NavList from "../common/NavList"
import useIsMobile from "../../components/custom-hook/useIsMobile"
import BottomNavBar from "./BottomNavBar"
import { useGenericDashboard } from "./index"
import useSparksFeedIsFullScreen from "components/views/sparks-feed/hooks/useSparksFeedIsFullScreen"

type Props = {
   isDark?: boolean 
}

const GenericNavList = ({isDark}: Props) => {
   const isMobile = useIsMobile()
   const isFullScreen = useSparksFeedIsFullScreen()
   const { navLinks } = useGenericDashboard()

   return isMobile || isFullScreen ? (
      <BottomNavBar links={navLinks} isDark={isDark} />
   ) : (
      <NavList links={navLinks} />
   )
}

export default GenericNavList
