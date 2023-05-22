import React, { useState } from "react"
import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import SectionHeader from "../../common/SectionHeader"
import Box from "@mui/material/Box"
import Fade from "@stahl.luke/react-reveal/Fade"
import CreateQuestion from "./CreateQuestion"
import { Grid, Hidden } from "@mui/material"
import { questionIcon } from "../../../../constants/svgs"
import {
   LivestreamEvent,
   LivestreamQuestion,
} from "@careerfairy/shared-lib/livestreams"
import { QuestionsComponent } from "../../livestream-dialog/views/livestream-details/main-content/Questions"

const styles = {
   header: {
      "&:not(:last-child)": {
         marginBottom: (theme) => theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
      textAlign: "left",
   },
   imgGrid: {
      overflow: "hidden",
      "& :first-child": {
         width: "100%",
         height: "100%",
      },
   },
   imgWrapper: {
      width: "100%",
      height: "100%",
      position: "relative",
      "& img": {
         position: "absolute",
         objectFit: "contain",
         maxWidth: "100%",
         maxHeight: "100%",
         transform: "translate(-50%, -50%)",
         top: "50%",
         left: "50%",
         padding: (theme) => theme.spacing(2),
      },
   },
   questionsWrapper: {
      height: 400,
      overflowY: "auto",
   },
}

type Props = {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   isPastEvent: boolean
   livestream: LivestreamEvent
   big: boolean
   color?: string
   subtitle?: string
   title: string
   questionsAreDisabled: boolean
   sectionRef: any
   sectionId: string
}

const QuestionsSection = ({
   backgroundColor,
   backgroundImage,
   backgroundImageClassName,
   backgroundImageOpacity,
   big,
   color,
   isPastEvent,
   livestream,
   questionsAreDisabled,
   sectionId,
   sectionRef,
   subtitle,
   title,
}: Props) => {
   const [newlyCreatedQuestion, setNewlyCreatedQuestion] =
      useState<LivestreamQuestion | null>(null)

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
         <SectionContainer maxWidth="lg">
            <Grid spacing={2} container>
               <Hidden mdDown>
                  <Grid sx={styles.imgGrid} item xs={12} md={4}>
                     <Fade left>
                        <Box sx={styles.imgWrapper}>
                           <img
                              src={questionIcon}
                              alt="question prompt illustration"
                           />
                        </Box>
                     </Fade>
                  </Grid>
               </Hidden>
               <Grid item xs={12} md={8}>
                  {title ? (
                     <Fade bottom>
                        <SectionHeader
                           color={color}
                           sx={styles.header}
                           title={title}
                           subtitle={subtitle}
                           titleSx={styles.title}
                        />
                     </Fade>
                  ) : null}
                  <Box marginTop={2} width="100%">
                     <Fade bottom>
                        <Box>
                           {questionsAreDisabled ? (
                              <Box py={6}>
                                 The Q&A feature has been disabled by the host
                                 for this live stream.
                              </Box>
                           ) : (
                              <>
                                 {!isPastEvent && (
                                    <CreateQuestion
                                       onQuestionAdded={setNewlyCreatedQuestion}
                                       livestream={livestream}
                                    />
                                 )}
                                 <Box sx={styles.questionsWrapper}>
                                    <QuestionsComponent
                                       key={newlyCreatedQuestion?.id} // this is to force a rerender when a new question is added
                                       livestream={livestream}
                                       newlyCreatedQuestion={
                                          newlyCreatedQuestion
                                       }
                                    />
                                 </Box>
                              </>
                           )}
                        </Box>
                     </Fade>
                  </Box>
               </Grid>
            </Grid>
         </SectionContainer>
      </Section>
   )
}

export default QuestionsSection
