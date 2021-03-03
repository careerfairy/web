import React, {useEffect, useState} from "react";
import {Button, Container, Grid, Icon, Image, Input} from "semantic-ui-react";

import Header from "../../components/views/header/Header";

import {withFirebasePage} from "context/firebase";
import Loader from "../../components/views/loader/Loader";
import DateUtil from "../../util/DateUtil";
import {useRouter} from "next/router";
import Footer from "../../components/views/footer/Footer";
import Countdown from "../../components/views/common/Countdown";
import BookingModal from "../../components/views/common/booking-modal/BookingModal";
import QuestionVotingBox from "../../components/views/question-voting-box/QuestionVotingBox";
import StringUtils from "../../util/StringUtils";

import Head from "next/head";
import UserUtil from "../../data/util/UserUtil";
import MulitLineText from "../../components/views/common/MultiLineText";
import TargetOptions from "../../components/views/NextLivestreams/GroupsCarousel/TargetOptions";
import GroupJoinToAttendModal from "components/views/NextLivestreams/GroupStreams/GroupJoinToAttendModal";
import DataAccessUtil from "util/DataAccessUtil";
import {makeStyles} from "@material-ui/core/styles";
import {speakerPlaceholder} from "../../components/util/constants";
import {useAuth} from "../../HOCs/AuthProvider";
import GroupsUtil from "../../data/util/GroupsUtil";
import {Paper, Avatar, Box} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    speakerAvatar: {
        width: 110,
        height: 110,
        boxShadow: theme.shadows[6]
    },
    speakerWrapper: {
        display: "flex !important",
        flexDirection: "column !important",
        alignItems: "center !important"
    },
    logoWrapper: {
        padding: theme.spacing(2)
    }
}))


function UpcomingLivestream(props) {
    const classes = useStyles()
    const router = useRouter();
    const {livestreamId, groupId} = router.query;
    const absolutePath = router.asPath;

    const {userData, authenticatedUser: user} = useAuth();
    const [upcomingQuestions, setUpcomingQuestions] = useState([]);
    const [newQuestionTitle, setNewQuestionTitle] = useState("");
    const [currentLivestream, setCurrentLivestream] = useState(null);
    const [registration, setRegistration] = useState(false);

    const [userIsInTalentPool, setUserIsInTalentPool] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [groupsWithPolicies, setGroupsWithPolicies] = useState([]);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [careerCenters, setCareerCenters] = useState([]);
    const [currentGroup, setCurrentGroup] = useState(null);
    const [targetOptions, setTargetOptions] = useState([]);

    const [openJoinModal, setOpenJoinModal] = useState(false);


    useEffect(() => {
        if (livestreamId) {
            const unsubscribe = props.firebase.listenToLivestreamQuestions(
                livestreamId,
                (querySnapshot) => {
                    var questionsList = [];
                    querySnapshot.forEach((doc) => {
                        let question = doc.data();
                        question.id = doc.id;
                        questionsList.push(question);
                    });
                    setUpcomingQuestions(questionsList);
                }
            );
            return () => unsubscribe();
        }
    }, [livestreamId, user]);

    useEffect(() => {
        if (groupId) {
            const unsubscribe = props.firebase.listenToCareerCenterById(
                groupId,
                (querySnapshot) => {
                    let group = querySnapshot.data();
                    group.id = querySnapshot.id;
                    setCurrentGroup(group);
                }
            );
            return () => unsubscribe();
        }
    }, [groupId]);

    useEffect(() => {
        if (livestreamId) {
            const unsubscribe = props.firebase.listenToScheduledLivestreamById(
                livestreamId,
                (querySnapshot) => {
                    if (querySnapshot.data()) {
                        let livestream = querySnapshot.data();
                        livestream.id = querySnapshot.id;
                        setCurrentLivestream(livestream);
                    }
                }
            );
            return () => unsubscribe();
        }
    }, [livestreamId]);

    useEffect(() => {
        if (
            user &&
            currentLivestream &&
            currentLivestream.registeredUsers &&
            currentLivestream.registeredUsers.indexOf(user.email) > -1
        ) {
            setRegistered(true);
        } else {
            setRegistered(false);
        }
    }, [currentLivestream, user]);

    useEffect(() => {
        if (currentGroup && currentGroup.categories && currentLivestream && currentLivestream.targetCategories) {
            const {groupId, categories} = currentGroup;
            let totalOptions = [];
            categories.forEach((category) => totalOptions.push(category.options));
            const flattenedOptions = totalOptions.reduce(function (a, b) {
                return a.concat(b);
            }, []);
            const matchedOptions = currentLivestream.targetCategories[groupId];
            if (matchedOptions) {
                const filteredOptions = flattenedOptions.filter((option) =>
                    matchedOptions.includes(option.id)
                );
                setTargetOptions(filteredOptions);
            }
        }
    }, [currentGroup, currentLivestream]);

    useEffect(() => {
        if (currentLivestream && currentLivestream.groupIds && currentLivestream.groupIds.length) {
            props.firebase.getDetailLivestreamCareerCenters(currentLivestream.groupIds)
                .then((querySnapshot) => {
                    let groupList = [];
                    querySnapshot.forEach((doc) => {
                        let group = doc.data();
                        group.id = doc.id;
                        groupList.push(group);
                    });
                    setCareerCenters(groupList);
                });
        }
    }, [currentLivestream]);

    useEffect(() => {
        if (
            userData &&
            currentLivestream &&
            userData.talentPools &&
            userData.talentPools.indexOf(currentLivestream.companyId) > -1
        ) {
            setUserIsInTalentPool(true);
        } else {
            setUserIsInTalentPool(false);
        }
    }, [currentLivestream, userData]);

    function goToSeparateRoute(route) {
        window.open("http://careerfairy.io" + route, "_blank");
    }

    function deregisterFromLivestream() {
        if (!user || !user.emailVerified) {
            return router.replace("/signup");
        }

        if (!userData) {
            return router.push("/profile");
        }

        props.firebase.deregisterFromLivestream(currentLivestream.id, user.email);
    }

    function joinTalentPool() {
        if (!user || !user.emailVerified) {
            return router.replace("/signup");
        }

        if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            return router.push("/profile");
        }

        props.firebase.joinCompanyTalentPool(
            currentLivestream.companyId,
            user.email,
            currentLivestream.id
        );
    }

    function leaveTalentPool() {
        if (!user || !user.emailVerified) {
            return router.replace("/signup");
        }

        if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            return router.push("/profile");
        }

        props.firebase.leaveCompanyTalentPool(
            currentLivestream.companyId,
            user.email,
            currentLivestream.id
        );
    }

    function userIsRegistered() {
        if (!user || !currentLivestream.registeredUsers) {
            return false;
        }
        return currentLivestream.registeredUsers.indexOf(user.email) > -1;
    }

    function sendEmailRegistrationConfirmation() {
        return DataAccessUtil.sendRegistrationConfirmationEmail(user, userData, currentLivestream);
    }

    function userFollowsSomeCareerCenter() {
        return userData.groupIds?.some(groupId => {
            return careerCenters.some(careerCenter => {
                return careerCenter.groupId === groupId;
            });
        })
    }

    const startRegistrationProcess = async (livestreamId) => {
        if (!user || !user.emailVerified) {
            return router.push(
                absolutePath
                    ? {
                        pathname: `/login`,
                        query: {absolutePath},
                    }
                    : "/signup"
            );
        }

        if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            return router.push("/profile");
        }

        const {
            hasAgreedToAll,
            groupsWithPolicies
        } = await GroupsUtil.getPolicyStatus(careerCenters, user.email, props.firebase)
        if (!hasAgreedToAll) {
            setOpenJoinModal(true)
            setGroupsWithPolicies(groupsWithPolicies)
        } else if (careerCenters.length > 0 && !userFollowsSomeCareerCenter()) {
            setOpenJoinModal(true)
        } else {
            setBookingModalOpen(true);
            setRegistration(true);
            props.firebase
                .registerToLivestream(currentLivestream.id, user.email, groupsWithPolicies)
                .then(() => {
                    sendEmailRegistrationConfirmation();
                    setRegistration(false);
                });
        }
    }

    function completeRegistrationProcess() {
        props.firebase.registerToLivestream(currentLivestream.id, user.email, groupsWithPolicies).then(() => {
            setBookingModalOpen(true);
            sendEmailRegistrationConfirmation();
        })
    }

    function handleCloseJoinModal() {
        setOpenJoinModal(false);
    }

    function deregisterFromLivestream(livestreamId) {
        if (!user || !user.emailVerified) {
            return router.push("/signup");
        }

        if (!userData || !UserUtil.userProfileIsComplete(userData)) {
            return router.push("/profile");
        }

        props.firebase.deregisterFromLivestream(livestreamId, user.email);
    }

    function dateIsInUnder24Hours(date) {
        return (
            new Date(date).getTime() - Date.now() < 1000 * 60 * 60 * 24 ||
            Date.now() > new Date(date).getTime()
        );
    }

    function addNewQuestion() {
        if (!user || !user.emailVerified) {
            return router.replace("/signup");
        }

        if (StringUtils.isEmpty(newQuestionTitle)) {
            return;
        }

        const newQuestion = {
            title: newQuestionTitle,
            votes: 0,
            type: "new",
            author: user.email,
        };

        props.firebase
            .putLivestreamQuestion(currentLivestream.id, newQuestion)
            .then(
                () => {
                    setNewQuestionTitle("");
                },
                () => {
                    console.log("Error");
                }
            );
    }

    let speakerElements = currentLivestream?.speakers?.map((speaker, index) => {
        return (
            <Grid.Column
                className={classes.speakerWrapper}
                verticalAlign="middle"
                textAlign="center"
                mobile="16"
                tablet="8"
                computer="5"
                key={speaker.id}
            >
                <div className="livestream-speaker-avatar-capsule">
                    <Avatar src={speaker?.avatar?.length ? speaker.avatar : speakerPlaceholder}
                            className={classes.speakerAvatar}/>
                </div>
                <div className="livestream-speaker-description">
                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: "1.2em",
                            marginBottom: "10px",
                            color: userIsRegistered() ? "white" : "rgb(44, 66, 81)",
                        }}
                    >
                        {speaker.firstName + " " + speaker.lastName}
                    </div>
                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: "0.9em",
                            marginBottom: "5px",
                            color: userIsRegistered() ? "white" : "rgb(44, 66, 81)",
                        }}
                    >
                        {speaker.position}
                    </div>
                    <div
                        style={{
                            fontWeight: "500",
                            fontSize: "0.9em",
                            marginBottom: "5px",
                            color: userIsRegistered() ? "white" : "rgb(140,140,140)",
                        }}
                    >
                        {speaker.background}
                    </div>
                </div>
                <style jsx>{`
                  .livestream-speaker-avatar-capsule {
                    border: 2px solid rgb(0, 210, 170);
                    display: inline-block;
                    margin: 20px auto;
                    padding: 8px;
                    border-radius: 50%;
                  }

                  .livestream-speaker-avatar {
                    width: 110px;
                    padding-top: 110px;
                    border-radius: 50%;
                    vertical-align: middle;
                    display: inline-block;
                    box-shadow: 0 0 2px grey;
                    background-size: cover;
                  }

                  .livestream-speaker-description {
                    display: inline-block;
                    vertical-align: middle;
                    width: 100%;
                    text-align: center;
                    margin: 0 0 0 10px;
                  }
                `}</style>
            </Grid.Column>
        );
    });

    let questionElements = upcomingQuestions.map((question, index) => {
        return (
            <Grid.Column key={index}>
                <QuestionVotingBox
                    question={question}
                    user={user}
                    livestream={currentLivestream}
                />
            </Grid.Column>
        );
    });

    let logoElements = careerCenters.map((careerCenter, index) => {
        return (
            <Grid.Column key={careerCenter.groupId} mobile="6" computer="4">
                <Paper className={classes.logoWrapper}>
                    <Image
                        src={careerCenter.logoUrl}
                        style={{
                            maxHeight: "60px",
                            margin: "10px auto 5px auto",
                        }}
                    />
                </Paper>
            </Grid.Column>
        );
    });

    if (!currentLivestream) {
        return <Loader/>;
    }

    if (currentLivestream.hasStarted) {
        router.replace("/streaming/" + currentLivestream.id + "/viewer");
    }

    return (
        <div>
            <div className="topLevelContainer">
                <Head>
                     {/*Primary Meta Tags */}
                    <title>CareerFairy | Upcoming Live Stream</title>
                    <meta name="title" content="CareerFairy | Upcoming Live Stream"/>
                    <meta name="description"
                          content={currentLivestream.title}/>

                    {/*Open Graph / Facebook */}
                    <meta property="og:type" content="website"/>
                    <meta property="og:url" content="https://metatags.io/"/>
                    <meta property="og:title" content="CareerFairy | Upcoming Live Stream"/>
                    <meta property="og:description"
                          content={currentLivestream.title}/>
                    <meta property="og:image"
                          content={currentLivestream.companyLogoUrl}/>

                     {/*Twitter*/}
                    <meta property="twitter:card" content="summary_large_image"/>
                    <meta property="twitter:url" content={`https://careerfairy.io/upcoming-livestream/${livestreamId}`}/>
                    <meta property="twitter:title" content="CareerFairy | Upcoming Live Stream"/>
                    <meta property="twitter:description"
                          content={currentLivestream.title}/>
                    <meta property="twitter:image"
                          content={currentLivestream.companyLogoUrl}/>
                    <meta property="og:title" content={currentLivestream.title} key="title"/>
                </Head>
                <Header color="white"/>
                <div
                    className="video-mask"
                    style={{
                        backgroundImage:
                            "url(" + currentLivestream.backgroundImageUrl + ")",
                    }}
                >
                    <div
                        className="mask"
                        style={{
                            backgroundColor: userIsRegistered()
                                ? "rgba(0, 210, 170, 0.9)"
                                : "",
                        }}
                    >
                        <Container>
                            <div
                                className="livestream-label"
                                style={{
                                    color: userIsRegistered() ? "white" : "",
                                    border: userIsRegistered() ? "2px solid white" : "",
                                }}
                            >
                                <Icon name="rss"/>
                                Live stream
                            </div>
                            <div
                                className="livestream-title"
                                style={{color: userIsRegistered() ? "white" : ""}}
                            >
                                {currentLivestream.title}
                            </div>
                            <div
                                className="livestream-date"
                                style={{color: userIsRegistered() ? "white" : ""}}
                            >
                <span>
                  <Icon name="calendar outline alternate"/>
                    {DateUtil.getPrettyDate(currentLivestream.start.toDate())}
                </span>
                            </div>
                            <div
                                className={
                                    "topDescriptionContainer " +
                                    (dateIsInUnder24Hours(currentLivestream.start.toDate())
                                        ? ""
                                        : "hidden")
                                }
                            >
                                <div
                                    className="countdown-title"
                                    style={{
                                        textAlign: "center",
                                        color: "rgb(255, 20, 147)",
                                        fontSize: "1.4em",
                                    }}
                                >
                                    Please wait here! You will be redirected when
                                    the stream
                                    starts.
                                </div>
                                <div
                                    style={{
                                        textAlign: "center",
                                        color: "rgb(255, 20, 147)",
                                    }}
                                >
                                    <Countdown
                                        date={currentLivestream.start.toDate()}>
                    <span style={{margin: "30px"}}>
                      This livestream will start shortly
                    </span>
                                    </Countdown>
                                </div>
                            </div>
                            <div style={{margin: "30px 0"}}>
                                <Grid className="middle aligned" centered>
                                    <Grid.Row>
                                        <Box>
                                            <Paper className={classes.logoWrapper}>
                                                <Image
                                                    src={currentLivestream.companyLogoUrl}
                                                    style={{
                                                        maxWidth: "230px",
                                                        maxHeight: "140px",
                                                        margin: "10px auto 5px auto",
                                                    }}
                                                />
                                            </Paper>
                                        </Box>
                                    </Grid.Row>
                                    <Grid.Row>{speakerElements}</Grid.Row>
                                </Grid>
                            </div>
                            <div style={{margin: "40px 0", width: "100%"}}>
                                <div>
                                    <Button
                                        size="big"
                                        id="register-button"
                                        content={
                                            user ? registered ? "Cancel" : "I'll attend!" : "Register to attend"
                                        }
                                        icon={registered ? "delete" : "plus"}
                                        style={{margin: "5px"}}
                                        onClick={
                                            registered
                                                ? () => deregisterFromLivestream(currentLivestream.id)
                                                : () => startRegistrationProcess(currentLivestream.id)
                                        }
                                        color={registered ? null : "teal"}
                                    />
                                    <Button
                                        size="big"
                                        content={"How Live Streams Work"}
                                        icon={"cog"}
                                        style={{margin: "5px"}}
                                        onClick={() => goToSeparateRoute("/howitworks")}
                                        color="pink"
                                    />
                                </div>
                            </div>
                            <div style={{textAlign: "center", marginBottom: "20px"}}>
                                <TargetOptions options={targetOptions}/>
                            </div>
                            <div style={{textAlign: "center", marginBottom: "20px"}}>
                                <Grid centered className="middle aligned">
                                    {logoElements}
                                </Grid>
                            </div>
                            <div className="topDescriptionContainer">
                                <div
                                    className="countdown-title"
                                    style={{
                                        textAlign: "center",
                                        color: registered ? "white" : "rgb(255, 20, 147)",
                                    }}
                                >
                                    This live stream starts here in
                                </div>
                                <div
                                    style={{
                                        textAlign: "center",
                                        color: "rgb(255, 20, 147)",
                                    }}
                                >
                                    <Countdown
                                        date={currentLivestream.start.toDate()}>
                    <span style={{margin: "30px"}}>
                      This livestream will start shortly
                    </span>
                                    </Countdown>
                                </div>
                            </div>
                        </Container>
                        <div className="bottom-icon">
                            <Icon
                                style={{color: "rgb(44, 66, 81)"}}
                                name="angle down"
                                size="big"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="white-container">
                <Container>
                    <div className="container-title">Short summary</div>
                    <div
                        style={{
                            fontSize: "1.3em",
                            lineHeight: "1.4em",
                            width: "80%",
                            margin: "0 auto",
                        }}
                    >
                        <MulitLineText text={currentLivestream.summary}/>
                    </div>
                </Container>
            </div>
            <div className="grey-container">
                <Container>
                    <div className="container-title">
                        Which questions should the speaker answer during the livestream?
                    </div>
                    <div style={{textAlign: "center"}}>
                        <Input
                            size="huge"
                            value={newQuestionTitle}
                            onChange={(event) => setNewQuestionTitle(event.target.value)}
                            maxLength="170"
                            fluid
                        />
                        <Button
                            size="huge"
                            content="Submit Your Question"
                            style={{margin: "20px 0 0 0"}}
                            onClick={() => addNewQuestion()}
                            primary
                        />
                    </div>
                    <div
                        className={
                            "container-title " +
                            (questionElements.length === 0 ? "hidden" : "")
                        }
                        style={{margin: "30px 0 0 0"}}
                    >
                        Upvote questions from your peers
                    </div>
                    <Grid stackable columns={3} style={{margin: "5px 0 30px 0"}}>
                        {questionElements}
                    </Grid>
                    <div
                        className={user ? "" : "hidden"}
                        style={{textAlign: "center"}}
                        className={questionElements.length === 0 ? "" : "hidden"}
                    >
                        The speaker is eagerly waiting for your input!
                    </div>
                </Container>
            </div>
            <div
                className={
                    "white-container " +
                    (currentLivestream.hasNoTalentPool ? "hidden" : "")
                }
                style={{
                    backgroundColor: userIsInTalentPool ? "rgb(0, 210, 170)" : "",
                }}
            >
                <Container>
                    <div
                        className="container-title"
                        style={{color: userIsInTalentPool ? "white" : ""}}
                    >
                        {userIsInTalentPool
                            ? "You are part of the talent pool"
                            : "Join the Talent Pool and Get Hired"}
                    </div>
                    <Grid
                        style={{margin: "50px 0 0 0"}}
                        className="middle aligned"
                        centered
                    >
                        <div>
                            <Box>
                                <Paper style={{maxWidth: 300}} className={classes.logoWrapper}>
                                    <Image
                                        src={
                                            currentLivestream.companyLogoUrl
                                                ? currentLivestream.companyLogoUrl
                                                : "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media"
                                        }
                                        style={{
                                            margin: "0 auto",
                                            maxHeight: "100px",
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </div>
                        <Grid.Column
                            computer="8"
                            mobile="16"
                            style={{textAlign: "center"}}
                        >
                            <Button
                                size="big"
                                content={
                                    userIsInTalentPool ? "Leave Talent Pool" : "Join Talent Pool"
                                }
                                icon={userIsInTalentPool ? "delete" : "handshake outline"}
                                onClick={
                                    userIsInTalentPool
                                        ? () => leaveTalentPool()
                                        : () => joinTalentPool()
                                }
                                primary={!userIsInTalentPool}
                            />
                        </Grid.Column>
                        <Grid.Column width={16}>
                            <div
                                style={{
                                    margin: "20px 0",
                                    color: userIsInTalentPool ? "white" : "",
                                }}
                            >
                                We want to make it easy for students and young pros to
                                find the
                                right company for them. To help you let companies know
                                that
                                you're interested in potentially joining - now or in the
                                future
                                -, we've invented the Talent Pool. By joining its talent
                                pool,
                                the company can contact you at any time with a relevant
                                opportunity.
                            </div>
                        </Grid.Column>
                    </Grid>
                </Container>
            </div>
            <div
                className={
                    "grey-container " +
                    (currentLivestream.hasNoTalentPool ? "hidden" : "")
                }
            >
                <div className="container-title">
                    Any problem or question ? We want to hear from you
                </div>
                <Container>
                    <Grid.Column width={16} style={{textAlign: "center"}}>
                        <a
                            className="aboutContentContactButton"
                            href="mailto:thomas@careerfairy.io"
                        >
                            <Button
                                size="big"
                                content="Contact CareerFairy"
                                style={{margin: "30px 0 0 0"}}
                            />
                        </a>
                    </Grid.Column>
                </Container>
            </div>
            <Footer/>
            <GroupJoinToAttendModal
                open={openJoinModal}
                groupsWithPolicies={groupsWithPolicies}
                groups={careerCenters}
                alreadyJoined={false}
                userData={userData}
                onConfirm={completeRegistrationProcess}
                closeModal={handleCloseJoinModal}
            />
            <BookingModal
                careerCenters={careerCenters}
                livestream={currentLivestream}
                groupId={groupId}
                modalOpen={bookingModalOpen}
                setModalOpen={setBookingModalOpen}
                registration={registration}
                setRegistration={(value) => setRegistration(value)}
                user={user}
            />
            <style jsx>{`
              .hidden {
                display: none;
              }

              .topLevelContainer {
                background-color: rgb(44, 66, 81);
                position: relative;
                width: 100%;
              }

              .topDescriptionContainer {
                width: 100%;
                position: relative;
                margin: 0 0 40px 0;
                padding: 0 30px;
              }

              .top-menu {
                background-color: rgba(250, 250, 250, 1);
                padding: 15px 0;
                height: 80px;
                text-align: center;
                position: relative;
                box-shadow: 0 0 5px grey;
              }

              .top-menu div, .top-menu button {
                display: inline-block;
                vertical-align: middle;
              }

              .top-menu #stream-button {
                margin: 0 50px;
              }

              .top-menu.active {
                background-color: rgba(0, 210, 170, 1);
                color: white;
              }

              .top-menu h3 {
                font-weight: 600;
              }

              .video-mask {
                width: 100%;
                background-color: rgb(230, 230, 230);
                background-size: cover;
                text-align: center;
              }

              .mask {
                width: 100%;
                padding: 20px 0 60px 0;
                background-color: rgba(255, 255, 255, 0.9);
              }

              .livestream-label {
                color: rgb(44, 66, 81);
                font-size: 1.3em;
                border: 3px solid rgb(44, 66, 81);
                display: inline-block;
                font-weight: 700;
                text-transform: uppercase;
                padding: 5px 10px;
                vertical-align: middle;
                margin: 20px 0 20px 0;
              }

              .livestream-title {
                font-size: calc(1.5em + 1.5vw);
                color: rgb(44, 66, 81);
                line-height: 1.4em;
                font-weight: 700;
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
              }

              .livestream-speaker-avatar-capsule {
                border: 2px solid rgb(0, 210, 170);
                display: inline-block;
                margin: 20px auto;
                padding: 8px;
                border-radius: 50%;
              }

              .livestream-speaker-avatar {
                width: 110px;
                padding-top: 110px;
                border-radius: 50%;
                vertical-align: middle;
                display: inline-block;
                box-shadow: 0 0 2px grey;
                display: inline-block;
                background-size: cover;
              }

              .livestream-date {
                text-align: center;
                font-size: 1.3em;
                font-weight: 700;
                color: rgb(255, 20, 147);
                vertical-align: middle;
                margin: 20px 0;
                width: 100%;
                text-transform: uppercase;
              }

              .livestream-speaker-image-container {
                display: inline-block;
                border: 2px solid rgb(0, 210, 170);
                border-radius: 50%;
              }

              .livestream-speaker-image {
                min-height: 100px;
                min-width: 100px;
                border-radius: 9999px;
                background-size: cover;
                background-position: center center;
                vertical-align: middle;
                margin: 20px auto;
              }

              .livestream-speaker-description {
                display: inline-block;
                vertical-align: middle;
                width: 100%;
                text-align: center;
                margin: 0 0 0 10px;
              }

              .livestream-speaker-name {
                display: inline-block;
                color: rgb(44, 66, 81);
                vertical-align: middle;
              }

              .livestream-speaker-name div:first-child {
                font-size: 1.4em;
                margin: 0 0 5px 0;
                font-weight: 600;
              }

              .video-mask-title {
                width: 100%;
                text-align: center;
                font-weight: 600;
                color: white;
                z-index: 4000;
                padding: 15px 0;
              }

              .countdown-title {
                text-transform: uppercase;
                font-weight: 700;
                color: rgb(120, 120, 120);
                margin: 40px 0 0 0;
              }

              .live-now {
                margin-bottom: 30px;
                text-transform: uppercase;
                font-size: 1.8em;
                vertical-align: middle;
                color: red;
              }

              .live-now span {
                margin-left: 10px;
              }

              .live-now i, .live-now span {
                vertical-align: middle;
              }

              .bottom-icon {
                color: rgb(44, 66, 81);
                position: absolute;
                bottom: 10px;
                width: 100%;
                text-align: center;
                font-size: 1.4em;
              }

              .container-title {
                text-transform: uppercase;
                text-align: center;
                font-size: 1.1em;
                font-weight: 700;
                margin-bottom: 20px;
                color: rgb(150, 150, 150);
              }

              .white-container {
                padding: 40px 0 50px 0;
                text-align: center;
              }

              .grey-container {
                position: relative;
                width: 100%;
                padding: 40px 0 50px 0;
                background-color: rgb(245, 245, 245);
              }

              .description {
                width: 70%;
                margin: 30px auto;
                line-height: 1.4em;
                text-align: center;
              }

              .spots-left {
                position: absolute;
                right: 40px;
                bottom: 40px;
                height: 100px;
                width: 100px;
                border-radius: 50%;
                background-color: white;
                text-align: center;
                padding: 28px 0;
              }

              .spots-left-number {
                font-size: 1.8em;
                font-weight: 700;
                color: rgb(0, 210, 170);
              }

              .spots-left-label {
                font-size: 1em;
                font-weight: 700;
                margin: 5px 0;
                color: rgb(44, 66, 81);
              }
            `}</style>
        </div>
    );
}

export default withFirebasePage(UpcomingLivestream);
