import React, { useCallback } from "react"
import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import HighlightText from "../../common/HighlightText"
import Logo from "../common/Logo"
import LogosComponent from "../common/LogosComponent"
import SectionHeader from "../../common/SectionHeader"
import { IColors, sxStyles } from "../../../../types/commonTypes"
import { Company } from "../../../../types/cmsTypes"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { useTheme } from "@mui/material/styles"

const styles = sxStyles({
   section: {
      paddingBottom: 20,
      [theme => theme.breakpoints.down("md")]: {
         paddingTop: 40,
      },
      "& :first-of-type": {
         fontWeight: 500,
      },
   },
})

interface CompaniesSectionFinanceBankingProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: IColors
   companies?: Company[]
}

const CompaniesSectionFinanceBanking: React.FC<CompaniesSectionFinanceBankingProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   companies,
}) => {
   const theme = useTheme()
   
   const title = "Trusted by Premier Financial Institutions"
   const subtitle = "Partner with leading banks and financial services companies to find top-tier talent"
   const overheadText = "Access professionals from the world's most prestigious financial organizations"

   // Filter companies by Finance&Banking industry or use provided companies
   const financeCompanies = companies?.filter(company => 
      company.industry?.includes("Finance&Banking") ||
      company.industry?.includes("Insurance") ||
      company.name?.toLowerCase().includes("goldman sachs") ||
      company.name?.toLowerCase().includes("morgan stanley") ||
      company.name?.toLowerCase().includes("jpmorgan") ||
      company.name?.toLowerCase().includes("deutsche bank") ||
      company.name?.toLowerCase().includes("credit suisse") ||
      company.name?.toLowerCase().includes("ubs") ||
      company.name?.toLowerCase().includes("barclays") ||
      company.name?.toLowerCase().includes("hsbc")
   ) || []

   const renderLogos = useCallback(() => {
      return financeCompanies.map(({ name, logo: { url = "" } }: Company) => (
         <Logo key={name} alt={name} logoUrl={getResizedUrl(url, "xs")} />
      ))
   }, [financeCompanies])

   return (
      <Section
         sx={styles.section}
         big={big}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <SectionContainer maxWidth="xl">
            <SectionHeader color={color} title={title} subtitle={subtitle} />
            <HighlightText text={overheadText} />
            <LogosComponent>{renderLogos()}</LogosComponent>
         </SectionContainer>
      </Section>
   )
}

export default CompaniesSectionFinanceBanking