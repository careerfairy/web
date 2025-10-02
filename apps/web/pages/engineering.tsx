import { NextPage } from "next"
import { Box } from "@mui/material"
import { EngineeringLandingPage } from "components/views/engineering/EngineeringLandingPage"
import GeneralLayout from "../layouts/GeneralLayout"
import SEO from "../components/util/SEO"

const EngineeringPage: NextPage = () => {
   return (
      <>
         <SEO
            title="Engineering Careers | CareerFairy"
            description="Engineer your path to success with industry experts. Connect with seasoned professionals from Tesla, Boeing, Siemens, and top engineering firms."
         />
         <GeneralLayout>
            <Box>
               <EngineeringLandingPage />
            </Box>
         </GeneralLayout>
      </>
   )
}

export default EngineeringPage