import { Box, Button, styled } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"
import { useLiveStreamDialog } from "../.."
import BaseDialogView from "../../BaseDialogView"
import { GetNotifiedCard } from "./GetNotifiedCard"
import { RecommendationsNav } from "./RecommendationsNav"

const styles = sxStyles({
   root: {
      padding: [0, "!important"],
      height: "100%",
      width: "100%",
      overflow: "auto",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 4,
      zIndex: 1,
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden",
      width: "100%",
      minHeight: "100%",
   },
   title: {
      color: "common.white",
      mb: 2,
      fontWeight: 600,
      textShadow: "0px 0px 8px rgba(0,0,0,0.5)",
   },
   variantLabel: {
      color: "common.white",
      mb: 1,
      fontWeight: 500,
      textShadow: "0px 0px 8px rgba(0,0,0,0.5)",
   },
   gridContainer: {
      width: "100%",
      maxWidth: 1200,
   },
})

const Layout = styled(Box)({
   minHeight: "100%",
   position: "relative",
})

const RecommendationsView = () => {
   const isMobile = useIsMobile()
   const { livestream } = useLiveStreamDialog()

   const [isExpanded, setIsExpanded] = useState(false)

   return (
      <BaseDialogView
         sx={styles.root}
         mainContent={
            <Layout>
               <Box sx={styles.container}>
                  <GetNotifiedCard
                     livestream={livestream}
                     onClose={() => console.log("Card closed")}
                     isExpanded={isExpanded}
                  />
                  <Button onClick={() => setIsExpanded(!isExpanded)}>
                     {isExpanded ? "Collapse" : "Expand"}
                  </Button>
               </Box>
               {Boolean(isMobile) && <RecommendationsNav />}
            </Layout>
         }
      />
   )
}

export default RecommendationsView
