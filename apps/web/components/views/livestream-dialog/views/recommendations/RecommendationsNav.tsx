import { styled } from "@mui/material/styles"
import { useNavLinks } from "hooks/useNavLinks"
import BottomNavBar from "layouts/GenericDashboardLayout/BottomNavBar"

const Nav = styled(BottomNavBar)({
   position: "absolute",
   bottom: 0,
   left: 0,
   right: 0,
   zIndex: 0,
   marginTop: "auto",
   minHeight: 72,
})

export const RecommendationsNav = () => {
   const navLinks = useNavLinks(true)

   return <Nav disableHighlight links={navLinks} id="recommendations-nav" />
}
