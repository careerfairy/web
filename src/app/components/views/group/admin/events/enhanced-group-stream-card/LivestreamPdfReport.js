import { Document, Page, View, Text, Font, Image } from '@react-pdf/renderer';
import styled from '@react-pdf/styled-components';
import IconsContainer from 'components/views/streaming/icons-container/IconsContainer';
import StatsUtil from 'data/util/StatsUtil';
import { useEffect, useState } from 'react';
import DateUtil from 'util/DateUtil';

Font.register({ family: 'Poppins', fonts: [
    { src: 'https://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLGT9Z1xlEN2JQEk.ttf', fontWeight: 'normal'},
    { src: 'https://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLDD4Z1xlEN2JQEk.ttf', fontWeight: 'bold'}
]});

const CFPage = styled.Page`
    font-family: 'Poppins';
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
`;

const CFLogoContainerSmall = styled.View`
    width: 15vw;
`;

const CFLogo = styled.Image`
    min-width: 15vw;
    width: auto;
`;

const CompanyLogo = styled.Image`
    max-height: 25vw;
    width: auto;
    height: auto;
`;

const SpeakerAvatar = styled.Image`
    max-height: 15vw;
`;

const Label = styled.Text`
    font-family: 'Poppins';
    text-transform: uppercase;
    font-weight: bold;
    font-size: 18px;
    color: #00d2aa;
`;

const Title = styled.Text`
    font-family: 'Poppins';
    font-weight: normal;
    font-size: 22px;
`;

const SubTitle = styled.Text`
    font-family: 'Poppins';
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

const FlexParent = styled.View`
    display: flex;
    flex-direction: row;
`;

const EngagementChild = styled.View`
    width: 25vw;
    margin-right: 5vw;
`;

const RatingChild = styled.View`
    width: 40vw;
    margin-right: 5vw;
`;

const RatingText = styled.Text`
    font-weight: bold;
    font-size: 12px;
    color: black;
`;

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


const TotalViewer = styled.Text`
    font-size: 11px;
    color: #555555;
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
    font-family: 'Poppins';
    font-size: 9px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    vertical-align: middle;
    margin-bottom: 5px;
    //height: 40px;
`;

const SmallView = styled.View`
    font-family: 'Poppins';
    font-size: 10px;
    width: 10vw;
    height: 30px;
    padding: 0 0 0 2px;
`;

const SpecializedSubCategoryElement = ({ subOption }) => {
    return (
        <SmallView>
            <SmallNumber>{ subOption.entries }</SmallNumber>
        </SmallView>
    );
}

const SpecializedCategoryElement = ({ option, index }) => {
    let subCategoryElements = Object.keys(option.subOptions).map( entry => {
        return <SpecializedSubCategoryElement subOption={option.subOptions[entry]}/>
    })
    return (
        <Border wrap={false}>
            <LargeText>{ option.name }</LargeText> 
            <LargeNumber>{ option.entries }</LargeNumber>
            <SubCategoryParent>
                { subCategoryElements }
            </SubCategoryParent>
        </Border>
    );
}

const QuestionView = ({ question }) => {
    return (
        <View>
            <QuestionText>{question.title}</QuestionText>
            <View>
                <QuestionVotes>{question.votes} votes</QuestionVotes>
            </View>
        </View>
    );
}

const PollOptionView = ({ option }) => {
    return (
        <View>
            <View/>
            <AnswerText>{ option.name }</AnswerText>
            <QuestionVotes>{ option.votes } Votes</QuestionVotes>
        </View>
    )
}

const PollView = ({ poll, index }) => {
    let totalVotes = 0;
    poll.options.forEach( option => totalVotes += option.votes );
    let pollOptionElements = poll.options.map( option => {
        return <PollOptionView option={option} totalVotes={totalVotes}/> 
    });

    return (
        <Poll>
            <SmallLabel>Poll {index + 1}</SmallLabel>
            <QuestionText>{poll.question}</QuestionText>
            { pollOptionElements }
        </Poll>
    );
}

const SpeakerView = ({ speaker }) => {
    let avatarUrl = speaker.avatar || 'https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media';
    return (
        <View>
            <View style={{ maxWidth: '15vw', borderRadius: '50%', marginRight: '10vw', marginBottom: '5px', border: '2px solid #00d2aa' }}>
                <SpeakerAvatar source={avatarUrl} />
            </View>
            <SmallLabel>{ speaker.firstName } { speaker.lastName }</SmallLabel>
        </View>
    );
}

const SpeakersViewElement = ({ speakers }) => {
    let speakerElements = speakers.map( speaker => {
        return <SpeakerView speaker={speaker}/> 
    });
    return (
        <SpeakersView>
            { speakerElements }
        </SpeakersView>
    );
}

const LivestreamPdfReport = ({ group, livestream, studentStats, overallRating, contentRating, totalViewerFromETH, totalViewerFromOutsideETH, totalStudentsInTalentPool, questions, polls, icons, speakers }) => {

    let categoryElements = [];
    let nameElements = [];
    let questionElements = [];
    let pollElements = [];

    function compareOptions(optionA, optionB) {
        return studentStats.options[optionB].entries - studentStats.options[optionA].entries;
    }

    if (studentStats && studentStats.type === 'specialized') {
        nameElements = studentStats.names.map( name => {
            return (
                <SmallView>
                    <SmallText>{ name }</SmallText>
                </SmallView>
            )
        })
        categoryElements = Object.keys(studentStats.options).sort(compareOptions).filter(option => studentStats.options[option].entries > 0).map( (option, index) => {
            return <SpecializedCategoryElement option={studentStats.options[option]} index={index}/>
        })
    }

    questionElements = questions.slice(0, 3).map( question => {
        return <QuestionView question={question}/>;
    })

    pollElements = polls.filter( poll => !poll.new ).map( (poll, index) => {
        return <PollView poll={poll} index={index}/>;
    })

    let numberOfUpvotes = 0;
    questions.forEach( question => numberOfUpvotes += question.votes );
    
    return (
        <Document>
            <CFPage>
                <TopView>
                    <CFLogoContainer>
                        <CFLogo source={group.logoUrl}/>
                    </CFLogoContainer>
                    <CFLogoContainerSmall>
                        <CFLogo source='https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcareerfairy.png?alt=media&token=bb70f6e3-9c0d-47e7-8c56-66063b4a211e'/>
                    </CFLogoContainerSmall>
                </TopView>     
                <View>
                    <View style={{ maxWidth: '25vw', marginBottom: '20px' }}>
                        <CompanyLogo source={livestream.companyLogoUrl}/>
                    </View>
                    <Label>Live Stream Report</Label>                  
                    <Title>{ livestream.title }</Title> 
                    <DateText>{ DateUtil.getPrettyDate(livestream.start.toDate()) }</DateText>
                    <SubTitle>Speakers</SubTitle>
                    <SpeakersViewElement speakers={speakers}/>
                    <SubTitle>Your Audience</SubTitle>
                    <TotalViewer>
                        Total Number Of Participating Students from {group.universityName}: { totalViewerFromETH }
                    </TotalViewer>
                    <TotalViewer>
                        Total Number Of Participating Students from outside {group.universityName}: { totalViewerFromOutsideETH }
                    </TotalViewer>
                    <TotalViewer>
                        Total Number Of Students registered to the Talent Pool: { totalStudentsInTalentPool }
                    </TotalViewer>
                    <CategoriesParent>
                        <Border>
                            <LargeText style={{ color: 'grey'}}>Faculty</LargeText> 
                            <LargeNumber style={{ color: 'grey'}}>#</LargeNumber>
                            <SubCategoryParent>
                                { nameElements }
                            </SubCategoryParent>
                        </Border>
                        { categoryElements }
                    </CategoriesParent>
                    <View wrap={false}>
                        <SubTitle>Viewer Ratings</SubTitle>
                        <FlexParent>
                            <RatingChild>
                                <View><RatingText>How would you rate this live stream?</RatingText></View>
                                <ColorText><Text>{ overallRating } / 5.0</Text></ColorText>
                            </RatingChild>
                            <RatingChild>
                                <View><RatingText>How happy are you with the content of this livestream ?</RatingText></View>
                                <ColorText><Text>{ contentRating } / 5.0</Text></ColorText>
                            </RatingChild>
                        </FlexParent>
                    </View>     
                    <View wrap={false}>    
                        <SubTitle>Engagement Figures</SubTitle>
                        <FlexParent>
                            <EngagementChild>
                                <View><Text># Questions</Text></View>
                                <ColorText><Text>{ questions.length }</Text></ColorText>
                            </EngagementChild>
                            <EngagementChild>
                                <View><Text># Reactions</Text></View>
                                <ColorText><Text>{ icons.length }</Text></ColorText>
                            </EngagementChild>
                            <EngagementChild>
                                <View><Text># Upvotes</Text></View>
                                <ColorText><Text>{ numberOfUpvotes }</Text></ColorText>
                            </EngagementChild>
                        </FlexParent>
                    </View>
                    <View wrap={false}>
                        <SubTitle>Most upvoted questions</SubTitle>
                        { questionElements }
                    </View>      
                    {/* <SubTitle>Your polls</SubTitle>
                    { pollElements } */}
                </View>
            </CFPage>
        </Document>
    )
};

export default LivestreamPdfReport;

