import React, { MutableRefObject } from "react"
import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import HighlightText from "components/views/common/HighlightText"
import SectionHeader from "../../common/SectionHeader"
import Box from "@mui/material/Box"
import { Typography } from "@mui/material"
import Fade from "@stahl.luke/react-reveal/Fade"
import LinkifyText from "../../../util/LinkifyText"
import { IColors, sxStyles } from "../../../../types/commonTypes"
import { Group } from "@careerfairy/shared-lib/groups"
import CompanyGroupInfo from "./CompanyGroupInfo"

const styles = sxStyles({
   header: {
      "&:not(:last-child)": {
         marginBottom: (theme) => theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
   },
})

type Props = {
   backgroundColor?: IColors
   backgroundImage?: any
   backgroundImageClassName?: any
   backgroundImageOpacity?: number
   big: boolean
   color?: IColors
   subtitle?: string
   title?: string
   sectionRef: MutableRefObject<any>
   sectionId: string
   overheadText: string
   forceReveal: boolean
   summary?: string
   reasonsToJoinLivestream?: string
   companyGroupData: Group | null
}

const AboutSection = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   subtitle,
   title,
   sectionRef,
   sectionId,
   overheadText,
   forceReveal,
   summary,
   reasonsToJoinLivestream,
   companyGroupData,
}: Props) => {
   const showCompanyPageData = Boolean(
      companyGroupData?.extraInfo ||
         (companyGroupData?.companyCountry &&
            companyGroupData?.companyIndustries.length &&
            companyGroupData?.companySize)
   )
   return (
      <Section
         big={big}
         sectionRef={sectionRef}
         sectionId={sectionId}
         color={color}
         backgroundImageClassName={backgroundImageClassName}
         backgroundImage={backgroundImage}
         backgroundImageOpacity={backgroundImageOpacity}
         backgroundColor={backgroundColor}
      >
         <SectionContainer>
            {overheadText ? (
               <Fade fraction={forceReveal ? 0 : 0.2} bottom>
                  <Box marginBottom={2}>
                     <HighlightText text={overheadText} />
                  </Box>
               </Fade>
            ) : null}
            {title ? (
               <Fade fraction={forceReveal ? 0 : 0.2} bottom>
                  <SectionHeader
                     color={color}
                     sx={styles.header}
                     title={title}
                     subtitle={subtitle}
                     titleSx={styles.title}
                  />
               </Fade>
            ) : null}

            {summary?.length ? (
               <Fade fraction={forceReveal ? 0 : 0.2} bottom>
                  <Box>
                     <LinkifyText>
                        <Typography
                           style={{ whiteSpace: "pre-line" }}
                           color="textSecondary"
                           variant="h6"
                        >
                           {summary}
                        </Typography>
                     </LinkifyText>
                  </Box>
               </Fade>
            ) : null}

            {reasonsToJoinLivestream?.trim()?.length ? (
               <Box width={"100%"} mt={6}>
                  <Fade fraction={forceReveal ? 0 : 0.2} bottom>
                     <Box>
                        <LinkifyText>
                           <Typography
                              style={{
                                 whiteSpace: "pre-line",
                                 fontWeight: "bold",
                              }}
                              variant="h6"
                              mb={1}
                           >
                              Why should you join the live stream
                           </Typography>

                           <Typography
                              style={{ whiteSpace: "pre-line" }}
                              color="textSecondary"
                              variant="h6"
                           >
                              {reasonsToJoinLivestream}
                           </Typography>
                        </LinkifyText>
                     </Box>
                  </Fade>
               </Box>
            ) : null}
            {showCompanyPageData ? (
               <Box width={"100%"} mt={6}>
                  <Fade fraction={forceReveal ? 0 : 0.2} bottom>
                     <CompanyGroupInfo companyGroupData={companyGroupData} />
                  </Fade>
               </Box>
            ) : null}
         </SectionContainer>
      </Section>
   )
}

export default AboutSection
