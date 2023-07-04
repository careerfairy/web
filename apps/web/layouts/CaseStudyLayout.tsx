import React, { FC } from "react"
import Box from "@mui/material/Box"
import Alert from "../components/cms/Alert"
import Footer from "../components/views/footer/Footer"
import GenericHeader from "../components/views/header/GenericHeader"
import GeneralNavDrawer from "../components/views/navbar/GeneralNavDrawer"

type Props = {
   preview: boolean
}
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
         <GeneralNavDrawer />
         {preview && <Alert />}
         <Box component={"main"}>{children}</Box>
         <Footer sx={{ mt: "auto" }} />
      </Box>
   )
}

export default CaseStudyLayout
