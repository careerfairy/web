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

interface CompaniesSectionEngineeringProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: IColors
   companies?: Company[]
}

const CompaniesSectionEngineering: React.FC<CompaniesSectionEngineeringProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   companies,
}) => {
   const theme = useTheme()
   
   const title = "Partnered with Industry-Leading Engineering Companies"
   const subtitle = "Connect with top engineering and manufacturing organizations seeking exceptional talent"
   const overheadText = "Discover opportunities with innovative companies shaping the future of engineering"

   // Filter companies by Engineering and Manufacturing industries or use provided companies
   const engineeringCompanies = companies?.filter(company => 
      company.industry?.includes("Engineering") || 
      company.industry?.includes("Manufacturing") ||
      company.name?.toLowerCase().includes("siemens") ||
      company.name?.toLowerCase().includes("boeing") ||
      company.name?.toLowerCase().includes("general electric") ||
      company.name?.toLowerCase().includes("caterpillar") ||
      company.name?.toLowerCase().includes("rolls-royce") ||
      company.name?.toLowerCase().includes("airbus") ||
      company.name?.toLowerCase().includes("ford") ||
      company.name?.toLowerCase().includes("tesla")
   ) || []

   const renderLogos = useCallback(() => {
      return engineeringCompanies.map(({ name, logo: { url = "" } }: Company) => (
         <Logo key={name} alt={name} logoUrl={getResizedUrl(url, "xs")} />
      ))
   }, [engineeringCompanies])

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

export default CompaniesSectionEngineering