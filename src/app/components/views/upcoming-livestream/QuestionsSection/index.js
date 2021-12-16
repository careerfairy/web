import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Section from "components/views/common/Section";
import SectionContainer from "../../common/Section/Container";
import SectionHeader from "../../common/SectionHeader";
import Box from "@material-ui/core/Box";
import Fade from "react-reveal/Fade";
import CreateQuestion from "./CreateQuestion";
import QuestionVotingContainer from "../../common/QuestionVotingContainer";

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
         <SectionContainer>
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
            <Box width="100%">
               <Fade bottom>
                  <Box>
                     <CreateQuestion
                        reFetchQuestions={props.reFetchQuestions}
                        livestreamId={props.livestreamId}
                     />
                     {!!props.questions.length && (
                        <QuestionVotingContainer
                           loadingInitialQuestions={
                              props.loadingInitialQuestions
                           }
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
