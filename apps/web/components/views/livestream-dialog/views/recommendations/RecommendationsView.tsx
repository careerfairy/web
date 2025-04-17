import { Box, styled } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { sxStyles } from "types/commonTypes"
import BaseDialogView from "../../BaseDialogView"
import { AnimatedBackground } from "./AnimatedBackground"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { RecommendationsNav } from "./RecommendationsNav"
const styles = sxStyles({
   root: {
      padding: [0, "!important"],
      height: "100%",
      width: "100%",
   },
})

const Layout = styled(Box)({
   height: "100%",
   position: "relative",
})

const RecommendationsView = () => {
   const isMobile = useIsMobile()

   return (
      <BaseDialogView
         sx={styles.root}
         mainContent={
            <Layout>
               <AnimatedBackground />
               <GetNotifiedCard isAppDownloaded />
               <GetNotifiedCard />
               {Boolean(isMobile) && <RecommendationsNav />}
            </Layout>
         }
      />
   )
}

export default RecommendationsView
