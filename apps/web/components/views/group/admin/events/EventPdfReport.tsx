import {
   Document,
   Font,
   Image,
   Page,
   StyleSheet,
   Text,
   View,
} from "@react-pdf/renderer"
import { Fragment } from "react"
import DateUtil from "util/DateUtil"
import * as PropTypes from "prop-types"
import { dynamicSort } from "../../../../helperFunctions/HelperFunctions"
import {
   PdfCategoryChartData,
   PdfCategoryChartOption,
   PdfReportData,
} from "@careerfairy/shared-lib/dist/groups/pdf-report"

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
})

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
      // @ts-ignore
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
})

const CFPage = (props) => <Page {...props} style={styles.cfPage} />

const TopView = (props) => <View {...props} style={styles.topView} />

const CFLogo = (props) => <Image {...props} style={styles.cfLogo} />

const CompanyLogo = (props) => <Image {...props} style={styles.companyLogo} />

const CompanyLogoView = (props) => (
   <View {...props} style={styles.companyLogoContainer} />
)

const GroupLogoImage = (props) => (
   <Image {...props} style={styles.groupLogoImage} />
)

const GroupLogoView = (props) => (
   <View {...props} style={styles.groupLogoView} />
)

const SpeakerAvatar = (props) => (
   <Image {...props} style={styles.speakerAvatar} />
)

const Label = (props) => <Text {...props} style={styles.label} />

const Title = (props) => <Text {...props} style={styles.title} />

const InlineView = (props) => <View {...props} style={styles.inlineView} />

const SubTitle = (props) => <Text {...props} style={styles.subTitle} />

const CategoriesParent = (props) => (
   <View {...props} style={styles.categoriesParent} />
)

const DisclaimerTitle = (props) => (
   <Text {...props} style={styles.disclaimerTitle} />
)

const GroupDisclaimerText = (props) => (
   <Text {...props} style={styles.groupDisclaimerText} />
)

const FlexParent = (props) => <View {...props} style={styles.flexParent} />

const PartnersWrapper = (props) => (
   <View {...props} style={styles.partnersWrapper} />
)

const PartnerItem = (props) => <View {...props} style={styles.partnerItem} />
const PartnerBreakdownItem = (props) => (
   <View
      {...props}
      style={{ ...styles.partnerItem, ...styles.partnerItemBreakdown }}
   />
)
const PartnerLogo = (props) => <Image {...props} style={styles.partnerLogo} />

const EngagementChild = (props) => (
   <View {...props} style={styles.engagementChild} />
)

const RatingChild = (props) => <View {...props} style={styles.ratingChild} />

const PageNumber = (props) => <Text {...props} style={styles.pageNumber} />
const RatingText = (props) => <Text {...props} style={styles.ratingText} />

const SubHeader = (props) => <Text {...props} style={styles.ratingText} />

const SubCategoryParent = (props) => (
   <View {...props} style={styles.subCategoryParent} />
)
const SpeakersView = (props) => <View {...props} style={styles.speakersView} />

const LargeNumber = (props) => <Text {...props} style={styles.largeNumber} />

const LargeText = (props) => <Text {...props} style={styles.largeText} />

const SmallNumber = (props) => <Text {...props} style={styles.smallNumber} />

const SmallText = (props) => <Text {...props} style={styles.smallText} />

const SmallLabel = (props) => <Text {...props} style={styles.smallLabel} />

const DateText = (props) => <Text {...props} style={styles.dateText} />

const QuestionText = (props) => <Text {...props} style={styles.questionText} />

const GroupSubTitle = (props) => (
   <Text
      {...props}
      style={{ ...styles.questionText, ...styles.groupSubTitle }}
   />
)

const AnswerText = (props) => <Text {...props} style={styles.answerText} />
const ColorText = (props) => <View {...props} style={styles.colorText} />

const Poll = (props) => <View {...props} style={styles.poll} />

const QuestionVotes = (props) => (
   <Text {...props} style={styles.questionVotes} />
)

const Border = (props) => <View {...props} style={styles.border} />

const SmallView = (props) => <View {...props} style={styles.smallView} />

interface CategoryElementProps {
   mainCategoryOption: PdfCategoryChartOption
}
const CategoryElement = ({ mainCategoryOption }: CategoryElementProps) => {
   return (
      <Border wrap={false}>
         <LargeText>{mainCategoryOption.name}</LargeText>
         <LargeNumber>{mainCategoryOption.count}</LargeNumber>
         <SubCategoryParent>
            {mainCategoryOption.subCategoryOptions.map((subOption) => (
               <SmallView key={subOption.id}>
                  <SmallNumber>{subOption.count}</SmallNumber>
               </SmallView>
            ))}
         </SubCategoryParent>
      </Border>
   )
}

const QuestionView = ({ question }) => {
   return (
      <View>
         <QuestionText>{question.title}</QuestionText>
         <View>
            <QuestionVotes>{question.votes} votes</QuestionVotes>
         </View>
      </View>
   )
}

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
   )
}
//
// const PollOptionView = ({ option }) => {
//    return (
//       <View>
//          <View />
//          <AnswerText>{option.name}</AnswerText>
//          <QuestionVotes>{option.votes} Votes</QuestionVotes>
//       </View>
//    )
// }

// const PollView = ({ poll, index }) => {
//    let totalVotes = 0
//    poll.options.forEach((option) => (totalVotes += option.votes))
//    let pollOptionElements = poll.options.map((option) => {
//       return <PollOptionView option={option} totalVotes={totalVotes} />
//    })
//
//    return (
//       <Poll>
//          <SmallLabel>Poll {index + 1}</SmallLabel>
//          <QuestionText>{poll.question}</QuestionText>
//          {pollOptionElements}
//       </Poll>
//    )
// }

const SpeakerView = ({ speaker }) => {
   let avatarUrl =
      speaker.avatar ||
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media"
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
   )
}

const SpeakersViewElement = ({ speakers }) => {
   let speakerElements = speakers.map((speaker) => {
      return <SpeakerView key={speaker.id} speaker={speaker} />
   })
   return <SpeakersView>{speakerElements}</SpeakersView>
}

const getPercentage = (num1, num2) => {
   return `${((num1 / num2) * 100).toFixed(0)}%`
}

interface ReportPageProps {
   chartData: PdfCategoryChartData
   groupLogo?: string
   title: string
   subtitle: string
}
const ReportPage = ({
   chartData,
   groupLogo,
   title,
   subtitle,
}: ReportPageProps) => {
   return (
      <Fragment>
         {groupLogo && (
            <GroupLogoView break>
               <GroupLogoImage src={groupLogo} />
            </GroupLogoView>
         )}

         <Title>{title}</Title>
         <Fragment>
            <InlineView>
               <GroupSubTitle>{subtitle}</GroupSubTitle>
            </InlineView>
         </Fragment>

         <CategoriesParent>
            <Border>
               <LargeText style={{ color: "grey" }}>
                  {chartData.mainCategoryName}
               </LargeText>
               <LargeNumber style={{ color: "grey" }}>#</LargeNumber>
               <SubCategoryParent>
                  {chartData.subCategoryOptionNames.map((name) => (
                     <SmallView key={name}>
                        <SmallText>{name}</SmallText>
                     </SmallView>
                  ))}
               </SubCategoryParent>
            </Border>
            {chartData.mainCategoryOptions.map((option) => (
               <CategoryElement key={option.id} mainCategoryOption={option} />
            ))}
            {chartData.totalWithoutStats > 0 && (
               <Border wrap={false}>
                  <LargeText style={{ color: "grey" }}>
                     Other Study Backgrounds
                  </LargeText>
                  <LargeNumber style={{ color: "grey" }}>
                     {chartData.totalWithoutStats}
                  </LargeNumber>
               </Border>
            )}
         </CategoriesParent>
      </Fragment>
   )
}

ReportPage.propTypes = {
   report: PropTypes.any,
   nameElements: PropTypes.arrayOf(PropTypes.any),
   categoryElements: PropTypes.object,
   followersWithMissingData: PropTypes.any,
}

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
   )
}
const EventPdfReport = (props: PdfReportData) => {
   let questionElements = []
   let ratingsElements = []

   questionElements = props.summary.questions.slice(0, 3).map((question) => {
      return <QuestionView key={question.id} question={question} />
   })

   ratingsElements = props.summary.ratings.map((rating) => {
      return <RatingView key={rating.id} rating={rating} />
   })

   let numberOfVotes = 0
   props.summary.questions.forEach(
      (question) => (numberOfVotes += question.votes)
   )

   const isForUniversity = Boolean(
      props.summary?.requestingGroup?.universityCode
   )
   return (
      <Document
         title={`General Report ${props.summary.livestream.company} ${props.summary.livestream.id}.pdf`}
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
                     src={resolveImage(props.summary.requestingGroup.logoUrl)}
                  />
               </CompanyLogoView>
               <View>
                  <CFLogo src="https://www.careerfairy.io/logo_teal.png" />
               </View>
            </TopView>
            <View style={styles.topMargin}>
               {props.summary.requestingGroup.universityCode ? (
                  <TopView>
                     <CompanyLogoView>
                        <CompanyLogo
                           src={resolveImage(
                              props.summary.livestream.companyLogoUrl
                           )}
                        />
                     </CompanyLogoView>
                  </TopView>
               ) : null}
               <View>
                  <Label>Live Stream Report </Label>
                  <Title>{props.summary.livestream.title}</Title>
                  <DateText>
                     {DateUtil.getPrettyDate(
                        new Date(
                           // @ts-ignore
                           Date.parse(props.summary.livestream.startDateString)
                        )
                     )}
                  </DateText>
                  <SubTitle>Speakers</SubTitle>
                  <SpeakersViewElement speakers={props.summary.speakers} />
                  <View wrap={false}>
                     <SubTitle>Hosts</SubTitle>
                     <PartnersWrapper>
                        {props.hostsData.map((host) =>
                           host.hostLogoUrl ? (
                              <PartnerItem key={host.id}>
                                 <PartnerLogo src={host.hostLogoUrl} />
                              </PartnerItem>
                           ) : null
                        )}
                     </PartnersWrapper>
                  </View>
                  <View break wrap={false}>
                     <SubTitle>Your Audience</SubTitle>
                     <View>
                        <View>
                           <SubHeader>Total Participating Students: </SubHeader>
                        </View>
                        <ColorText>
                           <Text>{props.summary.totalParticipating}</Text>
                        </ColorText>
                     </View>
                     <View>
                        <View>
                           <SubHeader>
                              Total Students registered to the Talent Pool:{" "}
                           </SubHeader>
                        </View>
                        <ColorText>
                           <Text>
                              {props.summary.totalStudentsInTalentPool}
                           </Text>
                        </ColorText>
                     </View>
                  </View>
                  {isForUniversity ? (
                     <View wrap={false}>
                        <SubTitle>Where They Came From</SubTitle>
                        <PartnersWrapper>
                           {[...props.hostsData]
                              .sort(dynamicSort("totalParticipantsFromGroup"))
                              .filter(
                                 (host) =>
                                    host.numberOfStudentsFromUniversity > 0 &&
                                    host.isUniversity
                              )
                              .map((host) => (
                                 <PartnerBreakdown
                                    key={host.id}
                                    name={host.hostName}
                                    numberOfStudents={
                                       host.numberOfStudentsFromUniversity
                                    }
                                 />
                              ))}
                        </PartnersWrapper>
                     </View>
                  ) : (
                     <View wrap={false}>
                        <SubTitle>Most Popular Schools</SubTitle>
                        <PartnersWrapper>
                           {props.summary.mostCommonUniversities.map((uni) => (
                              <PartnerBreakdown
                                 key={uni.code}
                                 name={uni.name}
                                 numberOfStudents={uni.count}
                              />
                           ))}
                        </PartnersWrapper>
                     </View>
                  )}
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
                              <Text>{props.summary.questions.length}</Text>
                           </ColorText>
                        </EngagementChild>
                        <EngagementChild>
                           <View>
                              <Text># Reactions</Text>
                           </View>
                           <ColorText>
                              <Text>{props.summary.numberOfIcons}</Text>
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
                  {props.universityChartData && (
                     <View break>
                        <ReportPage
                           groupLogo={props.summary.requestingGroup.logoUrl}
                           title={`Your Audience from ${props.summary.requestingGroup.universityName}`}
                           subtitle={`Number Of Participating Students from
                        ${props.summary.requestingGroup.universityName}: ${props.universityChartData.totalWithStats}`}
                           chartData={props.universityChartData}
                        />
                     </View>
                  )}
                  {props.nonUniversityChartData && (
                     <View break>
                        <ReportPage
                           title={
                              isForUniversity
                                 ? "Participants from other universities"
                                 : "Your participants breakdown"
                           }
                           subtitle={`${
                              isForUniversity
                                 ? "Number Of Participants from other universities"
                                 : "Number Of Participants from your most popular schools"
                           }: ${props.nonUniversityChartData.totalWithStats}`}
                           chartData={props.nonUniversityChartData}
                        />
                     </View>
                  )}
                  {props.summary.totalParticipatingWithoutData > 0 && (
                     <View break>
                        <DisclaimerTitle>Disclaimer</DisclaimerTitle>
                        <GroupDisclaimerText>
                           * {props.summary.totalParticipatingWithoutData} of
                           the total {props.summary.totalParticipating}{" "}
                           participants for the event came from other sources
                        </GroupDisclaimerText>
                     </View>
                  )}
               </View>
            </View>
         </CFPage>
      </Document>
   )
}

/**
 * Some PNG images aren't rendered correctly
 *
 * @param url
 * @returns {Promise<unknown>|*}
 */
const resolveImage = (url) => {
   if (url.toLowerCase().indexOf(".png") !== -1) {
      // react-pdf accepts a Promise
      return convertImgToBase64URL(url)
   } else {
      return url
   }
}

//https://github.com/diegomura/react-pdf/issues/676#issuecomment-821109460
const convertImgToBase64URL = (url, outputFormat?: any) =>
   new Promise((resolve, reject) => {
      const img = document.createElement("img")
      img.crossOrigin = "Anonymous"
      img.onerror = (e) => {
         reject(e)
      }
      img.onload = function () {
         let canvas: HTMLCanvasElement = document.createElement("canvas")
         const ctx = canvas.getContext("2d")
         let dataURL
         canvas.height = img.height
         canvas.width = img.width
         ctx.drawImage(img, 0, 0, img.width, img.height)
         dataURL = canvas.toDataURL(outputFormat)
         canvas = null
         resolve(dataURL)
      }
      img.src = url
   })

export default EventPdfReport
