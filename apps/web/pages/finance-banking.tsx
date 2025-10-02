import { NextPage } from "next"
import { Box } from "@mui/material"
import { FinanceBankingLandingPage } from "components/views/finance-banking/FinanceBankingLandingPage"
import GeneralLayout from "../layouts/GeneralLayout"
import SEO from "../components/util/SEO"

const FinanceBankingPage: NextPage = () => {
   return (
      <>
         <SEO
            title="Finance & Banking Careers | CareerFairy"
            description="Accelerate your finance and banking career with expert guidance from industry leaders at Goldman Sachs, JPMorgan, and top financial institutions."
         />
         <GeneralLayout>
            <Box>
               <FinanceBankingLandingPage />
            </Box>
         </GeneralLayout>
      </>
   )
}

export default FinanceBankingPage