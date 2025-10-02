import React from "react"
import Section from "components/views/common/Section"
import SectionHeader from "components/views/common/SectionHeader"
import SectionContainer from "../../common/Section/Container"
import BenefitsGrid from "../../common/BenefitsGrid"
import { IColors } from "../../../../types/commonTypes"

interface BenefitsSectionFinanceBankingProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: IColors
   title?: string
   subtitle?: string
}

const BenefitsSectionFinanceBanking: React.FC<BenefitsSectionFinanceBankingProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   title,
   subtitle,
}) => {
   const defaultTitle = "Why Financial Institutions Trust CareerFairy"
   const defaultSubtitle = "Discover how our finance-focused approach helps you attract and recruit top financial talent"

   const financeBenefits = [
      {
         name: "Regulatory Expertise",
         description: "Connect with professionals who understand financial regulations, compliance requirements, and risk management frameworks.",
         icon: "📋",
      },
      {
         name: "Market Intelligence",
         description: "Access candidates with deep knowledge of financial markets, investment strategies, and economic trends.",
         icon: "📈",
      },
      {
         name: "Confidential Recruitment",
         description: "Conduct discreet recruitment processes suitable for sensitive financial sector hiring needs.",
         icon: "🔒",
      },
      {
         name: "Global Finance Network",
         description: "Tap into our international network of finance professionals across investment banking, corporate finance, and fintech.",
         icon: "🌐",
      },
   ]

   return (
      <Section
         big={big}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <SectionContainer>
            <SectionHeader
               color={color}
               title={title || defaultTitle}
               subtitle={subtitle || defaultSubtitle}
            />
            <BenefitsGrid benefits={financeBenefits} />
         </SectionContainer>
      </Section>
   )
}

export default BenefitsSectionFinanceBanking