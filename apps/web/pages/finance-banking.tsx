import { NextPage } from "next"
import { Box } from "@mui/material"
import { FinanceBankingLandingPage } from "components/views/finance-banking/FinanceBankingLandingPage"
import { MainLayout } from "components/layouts/MainLayout"

const FinanceBankingPage: NextPage = () => {
   return (
      <MainLayout
         title="Finance & Banking Careers | CareerFairy"
         description="Accelerate your finance and banking career with expert guidance from industry leaders at Goldman Sachs, JPMorgan, and top financial institutions."
      >
         <Box>
            <FinanceBankingLandingPage />
         </Box>
      </MainLayout>
   )
}

export default FinanceBankingPage