import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import HighlightText from "../../common/HighlightText"
import landingCompanies from "../../../../constants/landingCompanies"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import Logo from "../common/Logo"
import LogosComponent from "../common/LogosComponent"
import SectionHeader from "../../common/SectionHeader"
import { IColors } from "../../../../types/commonTypes"
import { Company } from "../../../../types/cmsTypes"
import { useCallback } from "react"
import { useTheme } from "@mui/material/styles"
import { MARKETING_LANDING_PAGE_PATH } from "../../../../constants/routes"
import { useRouter } from "next/router"

const styles = {
   section: (theme, isOnMarketingLandingPage) => {
      return {
         paddingBottom: 20,
         [theme.breakpoints.down("md")]: {
            paddingTop: isOnMarketingLandingPage ? "" : 40,
         },
         "& :first-of-type": {
            fontWeight: isOnMarketingLandingPage ? 500 : "inherit",
         },
      }
   },
}

const CompaniesSection = ({
   big,
   color,
   backgroundImageClassName,
   backgroundImage,
   backgroundImageOpacity,
   backgroundColor,
   title,
   subtitle,
   overheadText,
   companies,
}: Props) => {
   const theme = useTheme()
   const { pathname } = useRouter()
   const isOnMarketingLandingPage = pathname.includes(
      MARKETING_LANDING_PAGE_PATH
   )

   /**
    * To render the companies logos based on the CMS or the hard codes companies
    */
   const renderLogos = useCallback(() => {
      const companiesToRender = companies || landingCompanies
      return companiesToRender.map(({ name, logo: { url = "" } }: Company) => (
         <Logo key={name} alt={name} logoUrl={getResizedUrl(url, "xs")} />
      ))
   }, [companies])

   return (
      <Section
         sx={styles.section(theme, isOnMarketingLandingPage)}
         big={big}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <SectionContainer maxWidth={isOnMarketingLandingPage ? "xl" : "md"}>
            {title && (
               <SectionHeader color={color} title={title} subtitle={subtitle} />
            )}
            {overheadText && <HighlightText text={overheadText} />}
            <LogosComponent>{renderLogos()}</LogosComponent>
         </SectionContainer>
      </Section>
   )
}

export default CompaniesSection

type Props = {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: IColors
   subtitle?: string
   title?: string
   overheadText?: string
   companies?: Company[]
}
