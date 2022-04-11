import React, { FC } from "react"
import Box from "@mui/material/Box"
import Alert from "../components/cms/Alert"
import FooterV2 from "../components/views/footer/FooterV2"
import GenericHeader from "../components/views/header/GenericHeader"
import GenericDrawer from "../components/views/navbar/GenericDrawer"

type Props = {
   preview: boolean
}
const drawerWidth = 300
const CaseStudyLayout: FC<Props> = ({ children, preview }) => {
   return (
      <Box
         sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
            position: "relative",
         }}
      >
         <GenericHeader
            darkMode
            position="fixed"
            transparent
            hideNavOnScroll={true}
         />
         <GenericDrawer drawerWidth={drawerWidth} />
         {preview && <Alert />}
         <Box component={"main"}>{children}</Box>
         <FooterV2 sx={{ mt: "auto" }} />
      </Box>
   )
}

export default CaseStudyLayout
