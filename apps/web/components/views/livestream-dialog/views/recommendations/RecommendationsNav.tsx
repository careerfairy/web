import { useNavLinks } from "hooks/useNavLinks"
import BottomNavBar from "layouts/GenericDashboardLayout/BottomNavBar"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   wrapper: {
      position: "sticky",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 0,
      marginTop: "auto",
      // pt: 2,
      minHeight: 72,
   },
})

export const RecommendationsNav = () => {
   const navLinks = useNavLinks(true)
   return <BottomNavBar disableHighlight links={navLinks} sx={styles.wrapper} />
}
