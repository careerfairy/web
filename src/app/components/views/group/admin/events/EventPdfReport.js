import {
   Document,
   StyleSheet,
   Font,
   Text,
   View,
   Page,
   Image,
} from "@react-pdf/renderer";
import { Fragment } from "react";
import DateUtil from "util/DateUtil";
import * as PropTypes from "prop-types";
import { dynamicSort } from "../../../../helperFunctions/HelperFunctions";

Font.register({
   family: "Poppins",
   fonts: [
      {
         src: "https://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLGT9Z1xlEN2JQEk.ttf",
         fontWeight: "normal",
      },
      {
         src: "https://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLDD4Z1xlEN2JQEk.ttf",
         fontWeight: "bold",
      },
   ],
});

const styles = StyleSheet.create({
   cfPage: {
      fontFamily: "Poppins",
      padding: "5vw",
      position: "relative",
   },
   topView: {
      width: "90vw",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "4vw",
   },
   topMargin: {
      marginTop: "10vw",
   },
   cfLogo: {
      maxWidth: "20vw",
   },
   companyLogoContainer: {
      maxWidth: "20vw",
      maxHeight: "20vw",
   },
   companyLogo: {
      maxHeight: "70px",
   },
   groupLogoImage: {
      maxHeight: "20vw",
      width: "auto",
      height: "auto",
   },
   groupLogoView: {
      maxWidth: "20vw",
      marginBottom: "5vw",
   },
   speakerAvatar: {
      height: "14vw",
      width: "14vw",
      borderRadius: "50% !important",
      objectFit: "cover",
   },
   label: {
      fontFamily: "Poppins",
      textTransform: "uppercase",
      fontWeight: "bold",
      fontSize: "18px",
      color: "#00d2aa",
   },
   title: {
      fontFamily: "Poppins",
      fontWeight: "normal",
      fontSize: "22px",
   },
   inlineView: {
      display: "flex",
      flexDirection: "row",
   },
   subTitle: {
      fontFamily: "Poppins",
      fontWeight: "bold",
      color: "grey",
      fontSize: "10px",
      margin: "30px 0 5px 0",
      textTransform: "uppercase",
   },
   categoriesParent: {
      width: "90vw",
      margin: "5vw 0",
      display: "flex",
      flexDirection: "column",
   },
   disclaimerTitle: {
      fontFamily: "Poppins",
      fontSize: "12px",
   },
   groupDisclaimerText: {
      fontFamily: "Poppins",
      fontSize: "6px",
   },
   flexParent: {
      display: "flex",
      flexDirection: "row",
   },
   partnersWrapper: {
      display: "flex",
      flexWrap: "wrap",
      flexDirection: "row",
      justifyContent: "space-between",
   },
   partnerItem: {
      width: "28vw",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
   },
   partnerItemBreakdown: {
      alignItems: "flex-start",
   },
   partnerLogo: {
      width: "40%",
   },
   engagementChild: {
      width: "25vw",
      marginRight: "5vw",
   },
   ratingChild: {
      width: "40vw",
      marginRight: "5vw",
   },
   pageNumber: {
      fontSize: "10px",
      fontFamily: "Poppins",
      position: "absolute",
      bottom: "10px",
      right: "10px",
   },
   // SubHeader as well
   ratingText: { fontWeight: "bold", fontSize: "12px", color: "black" },
   subCategoryParent: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
   },
   speakersView: { display: "flex", flexDirection: "row", flexWrap: "wrap" },
   largeNumber: {
      fontWeight: "bold",
      fontSize: "14px",
      width: "10vw",
      color: "#314150",
   },
   largeText: {
      fontSize: "8px",
      width: "15vw",
      padding: "1px",
      fontWeight: "bold",
      marginRight: "5vw",
      textTransform: "uppercase",
      color: "#314150",
   },
   smallNumber: {
      fontWeight: "bold",
      fontSize: "14px",
      color: "#bbbbbb",
   },
   smallText: {
      fontWeight: "bold",
      fontSize: "8px",
      color: "grey",
   },
   smallLabel: {
      fontWeight: "bold",
      fontSize: "10px",
      color: "grey",
   },
   dateText: {
      fontSize: "14px",
      textTransform: "uppercase",
      fontWeight: "bold",
      color: "#bbbbbb",
   },
   questionText: {
      fontSize: "14px",
   },
   groupSubTitle: {
      fontSize: "14px",
      fontFamily: "Poppins",
      display: "flex",
      flexDirection: "row",
      color: "#555555",
   },
   answerText: {
      fontSize: "11px",
   },
   colorText: { fontWeight: "bold", color: "#00d2aa" },
   poll: { marginBottom: "20px" },
   questionVotes: {
      fontSize: "11px",
      textTransform: "uppercase",
      color: "#00d2aa",
   },
   border: {
      fontFamily: "Poppins",
      fontSize: "9px",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      verticalAlign: "middle",
      marginBottom: "5px",
   },
   smallView: {
      fontFamily: "Poppins",
      fontSize: "10px",
      width: "10vw",
      height: "30px",
      padding: "0 0 0 2px",
   },
});

const CFPage = (props) => <Page {...props} style={styles.cfPage} />;

const TopView = (props) => <View {...props} style={styles.topView} />;

const CFLogo = (props) => <Image {...props} style={styles.cfLogo} />;

const CompanyLogo = (props) => <Image {...props} style={styles.companyLogo} />;

const CompanyLogoView = (props) => (
   <View {...props} style={styles.companyLogoContainer} />
);

const GroupLogoImage = (props) => (
   <Image {...props} style={styles.groupLogoImage} />
);

const GroupLogoView = (props) => (
   <View {...props} style={styles.groupLogoView} />
);

const SpeakerAvatar = (props) => (
   <Image {...props} style={styles.speakerAvatar} />
);

const Label = (props) => <Text {...props} style={styles.label} />;

const Title = (props) => <Text {...props} style={styles.title} />;

const InlineView = (props) => <View {...props} style={styles.inlineView} />;

const SubTitle = (props) => <Text {...props} style={styles.subTitle} />;

const CategoriesParent = (props) => (
   <View {...props} style={styles.categoriesParent} />
);

const DisclaimerTitle = (props) => (
   <Text {...props} style={styles.disclaimerTitle} />
);

const GroupDisclaimerText = (props) => (
   <Text {...props} style={styles.groupDisclaimerText} />
);

const FlexParent = (props) => <View {...props} style={styles.flexParent} />;

const PartnersWrapper = (props) => (
   <View {...props} style={styles.partnersWrapper} />
);

const PartnerItem = (props) => <View {...props} style={styles.partnerItem} />;
const PartnerBreakdownItem = (props) => (
   <View
      {...props}
      style={{ ...styles.partnerItem, ...styles.partnerItemBreakdown }}
   />
);
const PartnerLogo = (props) => <Image {...props} style={styles.partnerLogo} />;

const EngagementChild = (props) => (
   <View {...props} style={styles.engagementChild} />
);

const RatingChild = (props) => <View {...props} style={styles.ratingChild} />;

const PageNumber = (props) => <Text {...props} style={styles.pageNumber} />;
const RatingText = (props) => <Text {...props} style={styles.ratingText} />;

const SubHeader = (props) => <Text {...props} style={styles.ratingText} />;

const SubCategoryParent = (props) => (
   <View {...props} style={styles.subCategoryParent} />
);
const SpeakersView = (props) => <View {...props} style={styles.speakersView} />;

const LargeNumber = (props) => <Text {...props} style={styles.largeNumber} />;

const LargeText = (props) => <Text {...props} style={styles.largeText} />;

const SmallNumber = (props) => <Text {...props} style={styles.smallNumber} />;

const SmallText = (props) => <Text {...props} style={styles.smallText} />;

const SmallLabel = (props) => <Text {...props} style={styles.smallLabel} />;

const DateText = (props) => <Text {...props} style={styles.dateText} />;

const QuestionText = (props) => <Text {...props} style={styles.questionText} />;

const GroupSubTitle = (props) => (
   <Text
      {...props}
      style={{ ...styles.questionText, ...styles.groupSubTitle }}
   />
);

const AnswerText = (props) => <Text {...props} style={styles.answerText} />;
const ColorText = (props) => <View {...props} style={styles.colorText} />;

const Poll = (props) => <View {...props} style={styles.poll} />;

const QuestionVotes = (props) => (
   <Text {...props} style={styles.questionVotes} />
);

const Border = (props) => <View {...props} style={styles.border} />;

const SmallView = (props) => <View {...props} style={styles.smallView} />;
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

const RatingView = ({ rating }) => {
   return (
      <RatingChild>
         <View>
            <RatingText>{rating.question}</RatingText>
         </View>
         <ColorText>
            <Text>{rating.overallRating} / 5.0</Text>
         </ColorText>
      </RatingChild>
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
            <SpeakerAvatar src={avatarUrl} />
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
               <GroupLogoImage src={report.group.logoUrl} />
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
   let ratingsElements = [];

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
      return <QuestionView key={question.id} question={question} />;
   });

   ratingsElements = summary.ratings.map((rating) => {
      return <RatingView key={rating.id} rating={rating} />;
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
               <CompanyLogoView>
                  <CompanyLogo
                     src={resolveImage(summary.requestingGroup.logoUrl)}
                  />
               </CompanyLogoView>
               <View>
                  <CFLogo src="https://www.careerfairy.io/logo_teal.png" />
               </View>
            </TopView>
            <View style={styles.topMargin}>
               {summary.requestingGroup.universityCode ? (
                  <TopView>
                     <CompanyLogoView>
                        <CompanyLogo
                           src={resolveImage(summary.livestream.companyLogoUrl)}
                        />
                     </CompanyLogoView>
                  </TopView>
               ) : null}
               <View>
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
                                 <PartnerLogo src={report.group.logoUrl} />
                              </PartnerItem>
                           ))}
                           {companyReport && (
                              <PartnerItem>
                                 <PartnerLogo
                                    src={companyReport.group.logoUrl}
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
                     <FlexParent>{ratingsElements}</FlexParent>
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
                           of the total {summary.totalParticipating}{" "}
                           participants for the event came from other sources
                        </GroupDisclaimerText>
                     </View>
                  )}
               </View>
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

/**
 * Some PNG images aren't rendered correctly
 *
 * @param url
 * @returns {Promise<unknown>|*}
 */
const resolveImage = (url) => {
   if (url.toLowerCase().indexOf(".png") !== -1) {
      // react-pdf accepts a Promise
      return convertImgToBase64URL(url);
   } else {
      return url;
   }
};

//https://github.com/diegomura/react-pdf/issues/676#issuecomment-821109460
const convertImgToBase64URL = (url, outputFormat) =>
   new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.crossOrigin = "Anonymous";
      img.onerror = (e) => {
         reject(e);
      };
      img.onload = function () {
         let canvas = document.createElement("CANVAS");
         const ctx = canvas.getContext("2d");
         let dataURL;
         canvas.height = img.height;
         canvas.width = img.width;
         ctx.drawImage(img, 0, 0, img.width, img.height);
         dataURL = canvas.toDataURL(outputFormat);
         canvas = null;
         resolve(dataURL);
      };
      img.src = url;
   });

export default EventPdfReport;
