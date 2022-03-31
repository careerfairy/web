import React, { FC } from "react"
import Box from "@mui/material/Box"
// import Alert from "../components/cms/Alert"
import FooterV2 from "../components/views/footer/FooterV2"
import GenericHeader from "../components/views/header/GenericHeader"

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
         }}
      >
         <GenericHeader
            darkMode
            position="fixed"
            transparent
            hideNavOnScroll={true}
         />
         {/*<Alert preview={preview} />*/}
         <Box component={"main"}>{children}</Box>
         <FooterV2 sx={{ mt: "auto" }} />
      </Box>
   )
}

export default CaseStudyLayout
