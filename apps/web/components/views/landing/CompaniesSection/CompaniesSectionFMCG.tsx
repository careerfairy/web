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

interface CompaniesSectionFMCGProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: IColors
   companies?: Company[]
}

const CompaniesSectionFMCG: React.FC<CompaniesSectionFMCGProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   companies,
}) => {
   const theme = useTheme()
   
   const title = "Trusted by Leading FMCG Companies"
   const subtitle = "Join top consumer goods brands in discovering exceptional talent through our platform"
   const overheadText = "Connect with professionals from the world's most innovative FMCG companies"

   // Filter companies by FMCG industry or use provided companies
   const fmcgCompanies = companies?.filter(company => 
      company.industry?.includes("FMCG") || 
      company.name?.toLowerCase().includes("unilever") ||
      company.name?.toLowerCase().includes("nestlé") ||
      company.name?.toLowerCase().includes("procter") ||
      company.name?.toLowerCase().includes("coca-cola") ||
      company.name?.toLowerCase().includes("pepsico") ||
      company.name?.toLowerCase().includes("danone") ||
      company.name?.toLowerCase().includes("johnson")
   ) || []

   const renderLogos = useCallback(() => {
      return fmcgCompanies.map(({ name, logo: { url = "" } }: Company) => (
         <Logo key={name} alt={name} logoUrl={getResizedUrl(url, "xs")} />
      ))
   }, [fmcgCompanies])

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

export default CompaniesSectionFMCG