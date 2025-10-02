import { NextPage } from "next"
import { Box } from "@mui/material"
import { FMCGLandingPage } from "components/views/fmcg/FMCGLandingPage"
import { MainLayout } from "components/layouts/MainLayout"

const FMCGPage: NextPage = () => {
   return (
      <MainLayout
         title="FMCG Careers | CareerFairy"
         description="Fast-track your FMCG career with expert guidance from top consumer goods professionals. Connect with leaders from Unilever, P&G, Nestlé, and more."
      >
         <Box>
            <FMCGLandingPage />
         </Box>
      </MainLayout>
   )
}

export default FMCGPage