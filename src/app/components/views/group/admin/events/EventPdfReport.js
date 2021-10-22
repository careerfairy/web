import { Document, Font, Text, View } from "@react-pdf/renderer";
import styled from "@react-pdf/styled-components";
import { Fragment } from "react";
import DateUtil from "util/DateUtil";
import * as PropTypes from "prop-types";
import { dynamicSort } from "../../../../helperFunctions/HelperFunctions";

Font.register({
   family: "Poppins",
   fonts: [
      {
         src:
            "https://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLGT9Z1xlEN2JQEk.ttf",
         fontWeight: "normal",
      },
      {
         src:
            "https://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLDD4Z1xlEN2JQEk.ttf",
         fontWeight: "bold",
      },
   ],
});

const CFPage = styled.Page`
   font-family: "Poppins";
   padding: 5vw;
   position: relative;
`;

const TopView = styled.View`
   width: 90vw;
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   margin-bottom: 10vw;
`;

const CFLogoContainer = styled.View`
   width: 25vw;
   display: flex;
   align-items: center !important;
   justify-content: flex-start !important;
   height: 100px;
`;

const CFLogoContainerSmall = styled(CFLogoContainer)`
   width: 20vw;
`;

const CFLogo = styled.Image`
   min-width: 15vw;
   width: auto;
   margin-right: auto;
   margin-bottom: auto;
   margin-top: auto;
`;

const CompanyLogo = styled.Image`
   max-height: 25vw;
   width: auto;
   height: auto;
`;
const GroupLogoImage = styled.Image`
   max-height: 20vw;
   width: auto;
   height: auto;
`;

const GroupLogoView = styled.View`
   max-width: 20vw;
   margin-bottom: 5vw;
`;

const SpeakerAvatar = styled.Image`
   height: 14vw;
   width: 14vw;
   border-radius: 50% !important;
   object-fit: cover;
`;

const Label = styled.Text`
   font-family: "Poppins";
   text-transform: uppercase;
   font-weight: bold;
   font-size: 18px;
   color: #00d2aa;
`;

const Title = styled.Text`
   font-family: "Poppins";
   font-weight: normal;
   font-size: 22px;
`;

const InlineView = styled.View`
   display: flex;
   flex-direction: row;
`;

const SubTitle = styled.Text`
   font-family: "Poppins";
   font-weight: bold;
   color: grey;
   font-size: 10px;
   margin: 30px 0 5px 0;
   text-transform: uppercase;
`;

const CategoriesParent = styled.View`
   max-width: 100vw !important;
   margin: 5vw 0;
`;

const DisclaimerTitle = styled.Text`
   font-family: "Poppins";
   font-size: 12px;
`;
const GroupDisclaimerText = styled.Text`
   font-family: "Poppins";
   font-size: 6px;
`;

const FlexParent = styled.View`
   display: flex;
   flex-direction: row;
`;
const PartnersWrapper = styled.View`
   display: flex;
   flex-wrap: wrap;
   flex-direction: row;
   justify-content: space-between;
`;

const PartnerItem = styled.View`
   width: 28vw;
   display: flex;
   flex-direction: column;
   align-items: flex-start;
`;
const PartnerBreakdownItem = styled(PartnerItem)`
   align-items: flex-start;
`;
const PartnerLogo = styled.Image`
   width: 40%;
`;

const EngagementChild = styled.View`
   width: 25vw;
   margin-right: 5vw;
`;

const RatingChild = styled.View`
   width: 40vw;
   margin-right: 5vw;
`;

const PageNumber = styled.Text`
   font-size: 10px;
   font-family: "Poppins";
   position: absolute;
   bottom: 10px;
   right: 10px;
`;
const RatingText = styled.Text`
   font-weight: bold;
   font-size: 12px;
   color: black;
`;

const SubHeader = styled(RatingText)``;

const SubCategoryParent = styled.View`
   display: flex;
   flex-direction: row;
   flex-wrap: wrap;
`;

const SpeakersView = styled.View`
   display: flex;
   flex-direction: row;
   flex-wrap: wrap;
`;

const LargeNumber = styled.Text`
   font-weight: bold;
   font-size: 14px;
   width: 10vw;
   color: #314150;
`;

const LargeText = styled.Text`
   font-size: 8px;
   width: 15vw;
   padding: 1px;
   font-weight: bold;
   margin-right: 5vw;
   text-transform: uppercase;
   color: #314150;
`;

const SmallNumber = styled.Text`
   font-weight: bold;
   font-size: 14px;
   color: #bbbbbb;
`;

const SmallText = styled.Text`
   font-weight: bold;
   font-size: 8px;
   color: grey;
`;

const SmallLabel = styled.Text`
   font-weight: bold;
   font-size: 10px;
   color: grey;
`;

const DateText = styled.Text`
   font-size: 14px;
   text-transform: uppercase;
   font-weight: bold;
   color: #bbbbbb;
`;

const QuestionText = styled.Text`
   font-size: 14px;
`;

const GroupSubTitle = styled(QuestionText)`
   font-family: "Poppins";
   display: flex;
   flex-direction: row;
   color: #555555;
`;

const AnswerText = styled.Text`
   font-size: 11px;
`;

const ColorText = styled.View`
   font-weight: bold;
   color: #00d2aa;
`;

const Poll = styled.View`
   margin-bottom: 20px;
`;

const QuestionVotes = styled.Text`
   font-size: 11px;
   text-transform: uppercase;
   color: #00d2aa;
`;

const Border = styled.View`
   font-family: "Poppins";
   font-size: 9px;
   display: flex;
   flex-direction: row;
   flex-wrap: wrap;
   vertical-align: middle;
   margin-bottom: 5px;
   //height: 40px;
`;

const SmallView = styled.View`
   font-family: "Poppins";
   font-size: 10px;
   width: 10vw;
   height: 30px;
   padding: 0 0 0 2px;
`;

const SpecializedSubCategoryElement = ({ subOption }) => {
   return (
      <SmallView>
         <SmallNumber>{subOption.entries}</SmallNumber>
      </SmallView>
   );
};

const SpecializedCategoryElement = ({ option }) => {
   let subCategoryElements = Object.keys(option.subOptions).map((entry) => {
      return (
         <SpecializedSubCategoryElement
            key={entry}
            subOption={option.subOptions[entry]}
         />
      );
   });
   return (
      <Border wrap={false}>
         <LargeText>{option.name}</LargeText>
         <LargeNumber>{option.entries}</LargeNumber>
         <SubCategoryParent>{subCategoryElements}</SubCategoryParent>
      </Border>
   );
};
const NonSpecializedCategoryElement = ({ options }) => {
   return options.map((option) => (
      <Border key={option.id} wrap={false}>
         <LargeText>{option.name}</LargeText>
         <LargeNumber>{option.entries}</LargeNumber>
      </Border>
   ));
};

const QuestionView = ({ question }) => {
   return (
      <View>
         <QuestionText>{question.title}</QuestionText>
         <View>
            <QuestionVotes>{question.votes} votes</QuestionVotes>
         </View>
      </View>
   );
};

const PollOptionView = ({ option }) => {
   return (
      <View>
         <View />
         <AnswerText>{option.name}</AnswerText>
         <QuestionVotes>{option.votes} Votes</QuestionVotes>
      </View>
   );
};

const PollView = ({ poll, index }) => {
   let totalVotes = 0;
   poll.options.forEach((option) => (totalVotes += option.votes));
   let pollOptionElements = poll.options.map((option) => {
      return <PollOptionView option={option} totalVotes={totalVotes} />;
   });

   return (
      <Poll>
         <SmallLabel>Poll {index + 1}</SmallLabel>
         <QuestionText>{poll.question}</QuestionText>
         {pollOptionElements}
      </Poll>
   );
};

const SpeakerView = ({ speaker }) => {
   let avatarUrl =
      speaker.avatar ||
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media";
   return (
      <View>
         <View
            style={{
               width: "15vw",
               height: "15vw",
               borderRadius: "50%",
               marginRight: "10vw",
               marginBottom: "5px",
               border: "2px solid #00d2aa",
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
            }}
         >
            <SpeakerAvatar source={avatarUrl} />
         </View>
         <SmallLabel>
            {speaker.firstName} {speaker.lastName}
         </SmallLabel>
      </View>
   );
};

const SpeakersViewElement = ({ speakers }) => {
   let speakerElements = speakers.map((speaker) => {
      return <SpeakerView key={speaker.id} speaker={speaker} />;
   });
   return <SpeakersView>{speakerElements}</SpeakersView>;
};

const getPercentage = (num1, num2) => {
   return `${((num1 / num2) * 100).toFixed(0)}%`;
};

const ReportPage = ({
   categoryElements,
   followersWithMissingData,
   report,
   onlyCompany,
}) => {
   return (
      <Fragment>
         {report.isUniversity && (
            <GroupLogoView break>
               <GroupLogoImage source={report.group.logoUrl} />
            </GroupLogoView>
         )}
         <Title break={!report.isUniversity}>
            {report.isUniversity
               ? `Your Audience from ${report.group.universityName}`
               : onlyCompany
               ? "Your participants breakdown"
               : "Participants from other universities"}
         </Title>
         <Fragment>
            <InlineView>
               {report.isUniversity ? (
                  <GroupSubTitle>
                     Number Of Participating Students from{" "}
                     {report.group.universityName}:{" "}
                     {report.isUniversity
                        ? report.numberOfStudentsFromUniversity
                        : report.numberOfStudentsFollowingCompany}
                  </GroupSubTitle>
               ) : (
                  <GroupSubTitle>
                     Number Of Participating Students:{" "}
                     {report.numberOfStudentsFollowingCompany}
                  </GroupSubTitle>
               )}
            </InlineView>
         </Fragment>

         <CategoriesParent>
            {categoryElements}
            {followersWithMissingData > 0 && (
               <Border wrap={false}>
                  <LargeText style={{ color: "grey" }}>
                     Other Study Backgrounds
                  </LargeText>
                  <LargeNumber style={{ color: "grey" }}>
                     {followersWithMissingData}
                  </LargeNumber>
               </Border>
            )}
         </CategoriesParent>
      </Fragment>
   );
};

ReportPage.propTypes = {
   report: PropTypes.any,
   nameElements: PropTypes.arrayOf(PropTypes.any),
   categoryElements: PropTypes.object,
   followersWithMissingData: PropTypes.any,
};

const PartnerBreakdown = ({ name, numberOfStudents }) => {
   return (
      <PartnerBreakdownItem>
         <SubHeader>{name}</SubHeader>
         <View>
            <ColorText>
               <Text>{numberOfStudents}</Text>
            </ColorText>
         </View>
      </PartnerBreakdownItem>
   );
};
const EventPdfReport = ({ universityReports, companyReport, summary }) => {
   let questionElements = [];

   function compareOptions(optionA, optionB, studentStats) {
      return (
         studentStats.options[optionB].entries -
         studentStats.options[optionA].entries
      );
   }

   const getNameElements = (studentStats) => {
      let nameElements = [];
      if (studentStats && studentStats.type === "specialized") {
         nameElements = studentStats.names.map((name) => {
            return (
               <SmallView key={name}>
                  <SmallText>{name}</SmallText>
               </SmallView>
            );
         });
      }
      return nameElements;
   };
   const getCategoryElements = (studentStats, report) => {
      let categoryElements = [];
      if (studentStats && studentStats.type === "specialized") {
         categoryElements = (
            <>
               <Border>
                  <LargeText style={{ color: "grey" }}>Faculty</LargeText>
                  <LargeNumber style={{ color: "grey" }}>#</LargeNumber>
                  <SubCategoryParent>
                     {getNameElements(studentStats)}
                  </SubCategoryParent>
               </Border>
               {Object.keys(studentStats.options)
                  .sort((optionA, optionB) =>
                     compareOptions(optionA, optionB, studentStats)
                  )
                  .filter((option) => studentStats.options[option].entries > 0)
                  .map((option, index) => {
                     return (
                        <SpecializedCategoryElement
                           option={studentStats.options[option]}
                           index={index}
                           key={index}
                        />
                     );
                  })}
            </>
         );
      } else if (studentStats && studentStats.type === "non-specialized") {
         const totalFollowers = report.isUniversity
            ? report.numberOfUniversityStudentsThatFollowingUniversity
            : report.numberOfStudentsFollowingCompany;
         categoryElements = studentStats.noneSpecializedStats.map((stats) => {
            const totalEntries = stats.options.reduce((acc, curr) => {
               acc += curr.entries || 0;
               return acc;
            }, 0);
            const followersWithMissingData = totalFollowers - totalEntries;
            return (
               <>
                  <Border>
                     <LargeText style={{ color: "grey" }}>
                        {stats.categoryName}
                     </LargeText>
                  </Border>
                  <NonSpecializedCategoryElement
                     key={stats.id}
                     options={stats.options}
                  />
                  {followersWithMissingData > 0 && (
                     <Border wrap={false}>
                        <LargeText style={{ color: "grey" }}>
                           Other Study Backgrounds
                        </LargeText>
                        <LargeNumber style={{ color: "grey" }}>
                           {followersWithMissingData}
                        </LargeNumber>
                     </Border>
                  )}
               </>
            );
         });
      }
      return categoryElements;
   };

   const getNumberOfFollowersWithNoCategories = (report) => {
      const totalFollowers = report.isUniversity
         ? report.numberOfUniversityStudentsThatFollowingUniversity
         : report.numberOfStudentsFollowingCompany;
      let totalEntries;
      if (report.studentStats && report.studentStats.type === "specialized") {
         totalEntries = Object.keys(report.studentStats.options).reduce(
            (acc, curr) => {
               acc += report.studentStats.options[curr].entries || 0;
               return acc;
            },
            0
         );
      } else {
      }
      return totalFollowers - totalEntries;
   };

   questionElements = summary.questions.slice(0, 3).map((question) => {
      return <QuestionView question={question} />;
   });

   let numberOfVotes = 0;
   summary.questions.forEach((question) => (numberOfVotes += question.votes));

   return (
      <Document
         title={`General Report ${summary.livestream.company} ${summary.livestream.id}.pdf`}
      >
         <CFPage>
            <PageNumber
               render={({ pageNumber, totalPages }) =>
                  `${pageNumber} / ${totalPages}`
               }
               fixed
            />
            <TopView>
               <CFLogoContainer>
                  <CFLogo source={summary.requestingGroup.logoUrl} />
               </CFLogoContainer>
               <CFLogoContainerSmall>
                  <CFLogo source="https://www.careerfairy.io/logo_teal.png" />
               </CFLogoContainerSmall>
            </TopView>
            <View>
               <View style={{ maxWidth: "25vw", marginBottom: "20px" }}>
                  <CompanyLogo source={summary.livestream.companyLogoUrl} />
               </View>
               <Label>Live Stream Report </Label>
               <Title>{summary.livestream.title}</Title>
               <DateText>
                  {DateUtil.getPrettyDate(
                     new Date(Date.parse(summary.livestream.startDateString))
                  )}
               </DateText>
               <SubTitle>Speakers</SubTitle>
               <SpeakersViewElement speakers={summary.speakers} />
               {!!universityReports.length && (
                  <View wrap={false}>
                     <SubTitle>Hosts</SubTitle>
                     <PartnersWrapper>
                        {universityReports.map((report) => (
                           <PartnerItem key={report.group.id}>
                              <PartnerLogo source={report.group.logoUrl} />
                           </PartnerItem>
                        ))}
                        {companyReport && (
                           <PartnerItem>
                              <PartnerLogo
                                 source={companyReport.group.logoUrl}
                              />
                           </PartnerItem>
                        )}
                     </PartnersWrapper>
                  </View>
               )}
               <View break wrap={false}>
                  <SubTitle>Your Audience</SubTitle>
                  <View>
                     <View>
                        <SubHeader>Total Participating Students: </SubHeader>
                     </View>
                     <ColorText>
                        <Text>{summary.totalParticipating}</Text>
                     </ColorText>
                  </View>
                  <View>
                     <View>
                        <SubHeader>
                           Total Students registered to the Talent Pool:{" "}
                        </SubHeader>
                     </View>
                     <ColorText>
                        <Text>{summary.totalStudentsInTalentPool}</Text>
                     </ColorText>
                  </View>
               </View>
               <View wrap={false}>
                  <SubTitle>Where They Came From</SubTitle>
                  <PartnersWrapper>
                     {[...universityReports]
                        .sort(dynamicSort("totalParticipantsFromGroup"))
                        .map((report) => (
                           <PartnerBreakdown
                              key={report.group.id}
                              name={report.group.universityName}
                              numberOfStudents={
                                 report.numberOfStudentsFromUniversity
                              }
                           />
                        ))}
                     {companyReport && (
                        <PartnerBreakdown
                           name={companyReport.group.universityName}
                           numberOfStudents={
                              companyReport.numberOfStudentsFollowingCompany
                           }
                        />
                     )}
                  </PartnersWrapper>
               </View>
               <View wrap={false}>
                  <SubTitle>Viewer Ratings</SubTitle>
                  <FlexParent>
                     <RatingChild>
                        <View>
                           <RatingText>
                              How would you rate this live stream?
                           </RatingText>
                        </View>
                        <ColorText>
                           <Text>{summary.overallRating} / 5.0</Text>
                        </ColorText>
                     </RatingChild>
                     <RatingChild>
                        <View>
                           <RatingText>
                              How happy are you with the content of this
                              livestream ?
                           </RatingText>
                        </View>
                        <ColorText>
                           <Text>{summary.contentRating} / 5.0</Text>
                        </ColorText>
                     </RatingChild>
                  </FlexParent>
               </View>
               <View wrap={false}>
                  <SubTitle>Engagement Figures</SubTitle>
                  <FlexParent>
                     <EngagementChild>
                        <View>
                           <Text># Questions</Text>
                        </View>
                        <ColorText>
                           <Text>{summary.questions.length}</Text>
                        </ColorText>
                     </EngagementChild>
                     <EngagementChild>
                        <View>
                           <Text># Reactions</Text>
                        </View>
                        <ColorText>
                           <Text>{summary.numberOfIcons}</Text>
                        </ColorText>
                     </EngagementChild>
                     <EngagementChild>
                        <View>
                           <Text># Upvotes</Text>
                        </View>
                        <ColorText>
                           <Text>{numberOfVotes}</Text>
                        </ColorText>
                     </EngagementChild>
                  </FlexParent>
               </View>
               <View wrap={false}>
                  <SubTitle>Most upvoted questions</SubTitle>
                  {questionElements}
               </View>
               {universityReports.map((report) => (
                  <ReportPage
                     key={report.group.groupId}
                     report={report}
                     categoryElements={getCategoryElements(
                        report.studentStats,
                        report
                     )}
                     followersWithMissingData={getNumberOfFollowersWithNoCategories(
                        report
                     )}
                  />
               ))}
               {companyReport && (
                  <ReportPage
                     followersWithMissingData={getNumberOfFollowersWithNoCategories(
                        companyReport
                     )}
                     categoryElements={getCategoryElements(
                        companyReport.studentStats,
                        companyReport
                     )}
                     onlyCompany={Boolean(!universityReports?.length)}
                     report={companyReport}
                  />
               )}
               {summary.numberOfStudentsThatDontFollowCompanyOrIsNotAUniStudent >
                  0 && (
                  <View break>
                     <DisclaimerTitle>Disclaimer</DisclaimerTitle>
                     <GroupDisclaimerText>
                        *{" "}
                        {
                           summary.numberOfStudentsThatDontFollowCompanyOrIsNotAUniStudent
                        }{" "}
                        of the total {summary.totalParticipating} participants
                        for the event came from other sources
                     </GroupDisclaimerText>
                  </View>
               )}
            </View>
         </CFPage>
      </Document>
   );
};

EventPdfReport.propTypes = {
   summary: PropTypes.shape({
      requestingGroup: PropTypes.object,
      totalParticipating: PropTypes.number,
      totalSumOfUniversityStudents: PropTypes.number,
      totalSumOfParticipatingStudentsWithStats: PropTypes.number,
      requestingGroupId: PropTypes.string,
      speakers: PropTypes.array,
      totalStudentsInTalentPool: PropTypes.number,
      overallRating: PropTypes.string,
      contentRating: PropTypes.string,
      livestream: PropTypes.object,
      questions: PropTypes.array,
      polls: PropTypes.array,
      numberOfIcons: PropTypes.number,
      numberOfStudentsThatDontFollowCompanyOrIsNotAUniStudent: PropTypes.number,
   }),
   universityReports: PropTypes.arrayOf(
      PropTypes.shape({
         numberOfStudentsFromUniversity: PropTypes.number,
         numberOfUniversityStudentsThatFollowingUniversity: PropTypes.number,
         numberOfUniversityStudentsWithNoStats: PropTypes.number,
         group: PropTypes.object,
         groupName: PropTypes.string,
         groupId: PropTypes.string,
         studentStats: PropTypes.object,
         isUniversity: PropTypes.bool,
      })
   ),
   companyReport: PropTypes.shape({
      numberOfStudentsFollowingCompany: PropTypes.number,
      group: PropTypes.object,
      groupName: PropTypes.string,
      groupId: PropTypes.string,
      studentStats: PropTypes.object,
      isUniversity: PropTypes.bool,
   }),
};

export default EventPdfReport;
