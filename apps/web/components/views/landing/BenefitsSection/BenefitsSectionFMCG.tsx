import React from "react"
import Section from "components/views/common/Section"
import SectionHeader from "components/views/common/SectionHeader"
import SectionContainer from "../../common/Section/Container"
import BenefitsGrid from "../../common/BenefitsGrid"
import { IColors } from "../../../../types/commonTypes"

interface BenefitsSectionFMCGProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: IColors
   title?: string
   subtitle?: string
}

const BenefitsSectionFMCG: React.FC<BenefitsSectionFMCGProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   title,
   subtitle,
}) => {
   const defaultTitle = "Why Choose CareerFairy for FMCG Recruitment?"
   const defaultSubtitle = "Discover the advantages of our industry-focused approach to finding consumer goods talent"

   const fmcgBenefits = [
      {
         name: "Brand-Focused Talent",
         description: "Connect with professionals who understand consumer behavior, brand management, and market dynamics in the FMCG space.",
         icon: "🎯",
      },
      {
         name: "Live Product Showcases",
         description: "Host interactive sessions where candidates can learn about your products and company culture in real-time.",
         icon: "📦",
      },
      {
         name: "Market Insights Access",
         description: "Gain access to professionals with deep understanding of consumer trends, retail partnerships, and supply chain optimization.",
         icon: "📊",
      },
      {
         name: "Global Reach",
         description: "Connect with FMCG talent across international markets, perfect for companies with global brand presence.",
         icon: "🌍",
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
            <BenefitsGrid benefits={fmcgBenefits} />
         </SectionContainer>
      </Section>
   )
}

export default BenefitsSectionFMCG