import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import SectionHeader from "../../common/SectionHeader";
import Box from "@material-ui/core/Box";
import Fade from "@stahl.luke/react-reveal/Fade";
import CreateQuestion from "./CreateQuestion";
import QuestionVotingContainer from "../../common/QuestionVotingContainer";
import { Grid, Hidden } from "@material-ui/core";
import { questionIcon } from "../../../../constants/svgs";

const useStyles = makeStyles((theme) => ({
   section: {},
   subTitle: {},
   header: {
      "&:not(:last-child)": {
         marginBottom: theme.spacing(1),
      },
   },
   title: {
      fontWeight: 600,
      textAlign: "left",
   },
   imgGrid: {
      // background: theme.palette.primary.main,
      overflow: "hidden",
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
         padding: theme.spacing(2),
      },
   },
}));

const QuestionsSection = (props) => {
   const classes = useStyles();

   return (
      <Section
         className={classes.section}
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
               <Hidden smDown>
                  <Grid className={classes.imgGrid} item xs={12} md={4}>
                     <Fade left>
                        <div className={classes.imgWrapper}>
                           <img
                              src={questionIcon}
                              alt="question prompt illustration"
                           />
                        </div>
                     </Fade>
                  </Grid>
               </Hidden>
               <Grid item xs={12} md={8}>
                  {props.title && (
                     <Fade bottom>
                        <SectionHeader
                           color={props.color}
                           className={classes.header}
                           title={props.title}
                           subtitle={props.subtitle}
                           titleClassName={classes.title}
                        />
                     </Fade>
                  )}
                  <Box marginTop={2} width="100%">
                     <Fade bottom>
                        <Box>
                           {!props.isPastEvent && (
                              <CreateQuestion
                                 reFetchQuestions={props.reFetchQuestions}
                                 livestreamId={props.livestreamId}
                              />
                           )}
                           {!!props.questions.length && (
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
                        </Box>
                     </Fade>
                  </Box>
               </Grid>
            </Grid>
         </SectionContainer>
      </Section>
   );
};

export default QuestionsSection;

QuestionsSection.propTypes = {
   backgroundColor: PropTypes.any,
   backgroundImage: PropTypes.any,
   backgroundImageClassName: PropTypes.any,
   backgroundImageOpacity: PropTypes.any,
   big: PropTypes.any,
   color: PropTypes.any,
   subtitle: PropTypes.any,
   title: PropTypes.any,
};
