import { NextPage } from "next"
import { Box } from "@mui/material"
import { FMCGLandingPage } from "components/views/fmcg/FMCGLandingPage"
import GeneralLayout from "../layouts/GeneralLayout"
import SEO from "../components/util/SEO"

const FMCGPage: NextPage = () => {
   return (
      <>
         <SEO
            title="FMCG Careers | CareerFairy"
            description="Fast-track your FMCG career with expert guidance from top consumer goods professionals. Connect with leaders from Unilever, P&G, Nestlé, and more."
         />
         <GeneralLayout>
            <Box>
               <FMCGLandingPage />
            </Box>
         </GeneralLayout>
      </>
   )
}

export default FMCGPage