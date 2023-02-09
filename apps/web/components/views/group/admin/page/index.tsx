import { Group } from "@careerfairy/shared-lib/groups"
import Header from "./Header"
import { createContext, useContext, useMemo } from "react"
import { Box } from "@mui/material"

type Props = {
   group: Group
}

type ICompanyPageContext = {
   group: Group
}

const CompanyPageContext = createContext<ICompanyPageContext>({
   group: null,
})

const CompanyPageOverview = ({ group }: Props) => {
   const contextValue = useMemo(
      () => ({
         group,
      }),
      [group]
   )

   return (
      <CompanyPageContext.Provider value={contextValue}>
         <Box>
            <Header />
            <Box>CONTEXT</Box>
         </Box>
      </CompanyPageContext.Provider>
   )
}

export const useCompanyPage = () =>
   useContext<ICompanyPageContext>(CompanyPageContext)

export default CompanyPageOverview
