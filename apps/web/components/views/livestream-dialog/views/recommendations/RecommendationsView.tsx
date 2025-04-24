import { Box, styled } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"
import BaseDialogView from "../../BaseDialogView"
import { DesktopView } from "./DesktopView"
import { MobileView } from "./MobileView"

const styles = sxStyles({
   root: {
      padding: [0, "!important"],
      height: "100%",
      width: "100%",
   },
})

const Layout = styled(Box)({
   minHeight: "100%",
   position: "relative",
   display: "flex",
   flexDirection: "column",
})

const RecommendationsView = () => {
   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         sx={styles.root}
         mainContent={
            <Layout>{isMobile ? <MobileView /> : <DesktopView />}</Layout>
         }
      />
   )
}

export default RecommendationsView
