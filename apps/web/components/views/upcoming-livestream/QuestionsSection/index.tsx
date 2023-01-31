import React from "react"
import Section from "components/views/common/Section"
import SectionContainer from "../../common/Section/Container"
import SectionHeader from "../../common/SectionHeader"
import Box from "@mui/material/Box"
import Fade from "@stahl.luke/react-reveal/Fade"
import CreateQuestion from "./CreateQuestion"
import QuestionVotingContainer from "../../common/QuestionVotingContainer"
import { Grid, Hidden } from "@mui/material"
import { questionIcon } from "../../../../constants/svgs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

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
}

type Props = {
   backgroundColor?: string
   backgroundImage?: string
   backgroundImageClassName?: string
   backgroundImageOpacity?: number
   isPastEvent: boolean
   reFetchQuestions: any
   livestream: LivestreamEvent
   big: boolean
   color?: string
   subtitle?: string
   title: string
   questionsAreDisabled: boolean
   sectionRef: any
   sectionId: string
   questions: any
   loadingInitialQuestions: any
   hasVoted: any
   hasMore: any
   handleUpvote: any
   questionSortType: any
   getMore: any
   handleChangeQuestionSortType: any
}

const QuestionsSection = (props: Props) => {
   return (
      <Section
         big={props.big}
         sectionRef={props.sectionRef}
         sectionId={props.sectionId}
         color={props.color}
         backgroundImageClassName={props.backgroundImageClassName}
         backgroundImage={props.backgroundImage}
         backgroundImageOpacity={props.backgroundImageOpacity}
         backgroundColor={props.backgroundColor}
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
                  {props.title && (
                     <Fade bottom>
                        <SectionHeader
                           color={props.color}
                           sx={styles.header}
                           title={props.title}
                           subtitle={props.subtitle}
                           titleSx={styles.title}
                        />
                     </Fade>
                  )}
                  <Box marginTop={2} width="100%">
                     <Fade bottom>
                        <Box>
                           {props.questionsAreDisabled ? (
                              <Box py={6}>
                                 The Q&A feature has been disabled by the host
                                 for this live stream.
                              </Box>
                           ) : (
                              <>
                                 {!props.isPastEvent && (
                                    <CreateQuestion
                                       reFetchQuestions={props.reFetchQuestions}
                                       livestream={props.livestream}
                                    />
                                 )}
                                 {!!props.questions.length && (
                                    // @ts-ignore
                                    <QuestionVotingContainer
                                       loadingInitialQuestions={
                                          props.loadingInitialQuestions
                                       }
                                       votingDisabled={props.isPastEvent}
                                       hasVoted={props.hasVoted}
                                       hasMore={props.hasMore}
                                       questionSortType={props.questionSortType}
                                       handleUpvote={props.handleUpvote}
                                       getMore={props.getMore}
                                       containerHeight={
                                          props.questions.length > 4
                                             ? 400
                                             : props.questions.length > 2
                                             ? 300
                                             : 170
                                       }
                                       questions={props.questions}
                                       handleChangeQuestionSortType={
                                          props.handleChangeQuestionSortType
                                       }
                                    />
                                 )}
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
