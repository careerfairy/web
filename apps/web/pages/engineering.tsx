import { NextPage } from "next"
import { Box } from "@mui/material"
import { EngineeringLandingPage } from "components/views/engineering/EngineeringLandingPage"
import { MainLayout } from "components/layouts/MainLayout"

const EngineeringPage: NextPage = () => {
   return (
      <MainLayout
         title="Engineering Careers | CareerFairy"
         description="Engineer your path to success with industry experts. Connect with seasoned professionals from Tesla, Boeing, Siemens, and top engineering firms."
      >
         <Box>
            <EngineeringLandingPage />
         </Box>
      </MainLayout>
   )
}

export default EngineeringPage