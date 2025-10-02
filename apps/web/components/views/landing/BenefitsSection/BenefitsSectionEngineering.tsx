import React from "react"
import Section from "components/views/common/Section"
import SectionHeader from "components/views/common/SectionHeader"
import SectionContainer from "../../common/Section/Container"
import BenefitsGrid from "../../common/BenefitsGrid"
import { IColors } from "../../../../types/commonTypes"

interface BenefitsSectionEngineeringProps {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   big?: boolean
   color?: IColors
   title?: string
   subtitle?: string
}

const BenefitsSectionEngineering: React.FC<BenefitsSectionEngineeringProps> = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   title,
   subtitle,
}) => {
   const defaultTitle = "Why Engineering Leaders Choose CareerFairy"
   const defaultSubtitle = "Discover how our technical approach helps you find the best engineering and manufacturing talent"

   const engineeringBenefits = [
      {
         name: "Technical Skill Assessment",
         description: "Evaluate candidates' problem-solving abilities through live technical workshops and real-world engineering challenges.",
         icon: "⚙️",
      },
      {
         name: "Industry Specialization",
         description: "Access engineers with expertise in manufacturing, automation, product development, and industrial processes.",
         icon: "🔧",
      },
      {
         name: "Innovation Showcase",
         description: "Present your latest projects and technological innovations to attract forward-thinking engineering professionals.",
         icon: "💡",
      },
      {
         name: "Cross-Disciplinary Teams",
         description: "Build diverse engineering teams by connecting with professionals from mechanical, electrical, software, and industrial engineering.",
         icon: "🤝",
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
            <BenefitsGrid benefits={engineeringBenefits} />
         </SectionContainer>
      </Section>
   )
}

export default BenefitsSectionEngineering