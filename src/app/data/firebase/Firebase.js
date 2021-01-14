import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
};

class Firebase {
    getFirebaseTimestamp = (dateString) => {
        return firebase.firestore.Timestamp.fromDate(new Date(dateString));
    };

    constructor() {
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
        this.auth = firebase.auth();
        this.firestore = firebase.firestore();
        this.storage = firebase.storage();
    }

    // *** Auth API ***

    createUserWithEmailAndPassword = (email, password) => {
        return this.auth.createUserWithEmailAndPassword(email, password);
    };

    signInWithEmailAndPassword = (email, password) => {
        return this.auth.signInWithEmailAndPassword(email, password);
    };

    doSignOut = () => this.auth.signOut();

    getUniversitiesFromCountryCode = (countryCode) => {
        let ref = this.firestore.collection("universitiesByCountry").doc(countryCode)
        return ref.get()
    }

    getUniversitiesFromCountryCode = (countryCode) => {
        let ref = this.firestore.collection("universitiesByCountry").doc(countryCode)
        return ref.get()
    }

    // *** Firestore API ***

    // USER

    getUserData = (userEmail) => {
        let ref = this.firestore.collection("userData").doc(userEmail);
        return ref.get();
    };

    listenToUserData = (userEmail, callback) => {
        let ref = this.firestore.collection("userData").doc(userEmail);
        return ref.onSnapshot(callback);
    };

    setUserData = (userEmail, firstName, lastName, linkedinUrl, universityCode, universityName, universityCountryCode) => {
        let ref = this.firestore.collection("userData").doc(userEmail);
        return ref.update({
            id: userEmail,
            userEmail,
            firstName,
            lastName,
            linkedinUrl,
            universityCode,
            universityName,
            universityCountryCode
        });
    };

    setUserUnsubscribed = (userEmail) => {
        let ref = this.firestore.collection("userData").doc(userEmail);
        return ref.update({
            unsubscribed: true
        });
    }

    updateUserGroups = (userEmail, groupIds, registeredGroups) => {
        let ref = this.firestore.collection("userData").doc(userEmail);
        return ref.update({
            groupIds,
            registeredGroups
        });
    };

    setgroups = (userId, arrayOfIds, arrayOfGroupObjects) => {
        let userRef = this.firestore.collection("userData").doc(userId);
        return userRef.update({
            groupIds: arrayOfIds,
            registeredGroups: arrayOfGroupObjects,
        });
    };

    listenToGroups = (callback) => {
        let groupRefs = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false);
        return groupRefs.onSnapshot(callback);
    };

    listenToUserGroupCategoryValue = (
        userEmail,
        groupId,
        categoryId,
        callback
    ) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userEmail)
            .collection("registeredGroups")
            .doc(groupId)
            .collection("categories")
            .doc(categoryId);
        return ref.onSnapshot(callback);
    };

    updateUserGroupCategoryValue = (userEmail, groupId, categoryId, value) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userEmail)
            .collection("registeredGroups")
            .doc(groupId)
            .collection("categories")
            .doc(categoryId);
        return ref.update({value: value});
    };

    // COMPANIES

    getCompanies = () => {
        let ref = this.firestore.collection("companyData").orderBy("rank", "asc");
        return ref.get();
    };

    getCompanyById = (companyId) => {
        let ref = this.firestore.collection("companyData").doc(companyId);
        return ref.get();
    };

    getCompaniesWithProfile = () => {
        let ref = this.firestore
            .collection("companyData")
            .where("profile", "==", true);
        return ref.get();
    };

    getCompanyPositions = (companyName) => {
        let ref = this.firestore
            .collection("companyData")
            .doc(companyName.replace(/\s/g, ""))
            .collection("currentPositions");
        return ref.get();
    };

    getCompanyVideos = (companyId) => {
        let ref = this.firestore
            .collection("videos")
            .where("companyId", "==", companyId)
            .orderBy("priority", "asc");
        return ref.get();
    };

    createCareerCenter = (careerCenter) => {
        let ref = this.firestore.collection("careerCenterData");
        return ref.add(careerCenter);
    }

    updateCareerCenter = (groupId, newCareerCenter) => {
        let ref = this.firestore.collection("careerCenterData").doc(groupId);
        return ref.update(newCareerCenter);
    };

    deleteCareerCenterFromAllUsers = (careerCenterId) => {
        let batch = this.firestore.batch();
        // get all relevant users
        return this.firestore
            .collection("userData")
            .where("groupIds", "array-contains", `${careerCenterId}`)
            .get()
            .then((querySnapshot) => {
                querySnapshot.docs.forEach((userDoc, index) => {
                    // get the user document
                    const userRef = userDoc.ref;
                    let userData = userDoc.data();
                    // remove the careerCenterId from the groupIds Array in the userData field
                    // remove the careerCenterId from the registeredGroups array of Objects
                    if (userData.registeredGroups) {
                        let registeredGroups = userData.registeredGroups;
                        const filteredRegisteredGroups = registeredGroups.filter(
                            (group) => group.groupId !== careerCenterId
                        );
                        batch.update(userRef, {
                            registeredGroups: filteredRegisteredGroups,
                            groupIds: firebase.firestore.FieldValue.arrayRemove(
                                careerCenterId
                            ),
                        });
                    } else {
                        batch.update(userRef, {
                            groupIds: firebase.firestore.FieldValue.arrayRemove(
                                careerCenterId
                            ),
                        });
                    }
                    if (index === querySnapshot.size - 1) {
                        // Once done looping, return the batch commit
                        return batch.commit();
                    }
                });
                return batch.commit();
            });
    }

    // MENTORS

    getMentors = () => {
        let ref = this.firestore.collection("mentors");
        return ref.get();
    };

    // WISHLIST

    getWishList = () => {
        let ref = this.firestore
            .collection("wishList")
            .orderBy("vote", "desc")
            .where("fulfilled", "==", false);
        return ref.get();
    };

    getLatestFulfilledWishes = () => {
        let ref = this.firestore
            .collection("wishList")
            .where("fulfilled", "==", true)
            .orderBy("vote", "desc");
        return ref.get();
    };

    addNewWish = (user, wish) => {
        let ref = this.firestore.collection("wishList");
        return ref.add({
            wish: wish,
            fulfilled: false,
            vote: 1,
            date: firebase.firestore.Timestamp.fromDate(new Date()),
        });
    };

    addVoteToWish = (wish, user) => {
        let ref = this.firestore.collection("wishList").doc(wish.id);
        return ref.update({
            vote: wish.vote + 1,
        });
    };

    // CREATE_LIVESTREAMS

    addLivestream = async (livestream, collection) => {
        try {
            let batch = this.firestore.batch();
            let livestreamsRef = this.firestore
                .collection(collection)
                .doc()
            livestream.currentSpeakerId = livestreamsRef.id
            livestream.id = livestreamsRef.id
            batch.set(livestreamsRef, livestream)
            await batch.commit()
            return livestreamsRef.id

        } catch (error) {
            return error
        }
    }

    deleteLivestream = async (livestreamId, collection) => {
        let batch = this.firestore.batch();
        let livestreamsRef = this.firestore
            .collection(collection)
            .doc(livestreamId)
        batch.delete(livestreamsRef)
        await batch.commit()
    }

    addDraftLivestream = async (livestream) => {
        let batch = this.firestore.batch();
        let livestreamsRef = this.firestore
            .collection("draftLivestreams")
            .doc()
        livestream.currentSpeakerId = livestreamsRef.id
        livestream.id = livestreamsRef.id
        batch.set(livestreamsRef, livestream)
        await batch.commit()
        return livestreamsRef.id
    }

    updateLivestream = async (livestream, collection) => {
        try {
            let batch = this.firestore.batch();
            let livestreamsRef = this.firestore
                .collection(collection)
                .doc(livestream.id)
            batch.update(livestreamsRef, livestream)
            await batch.commit()
            return livestream.id
        } catch (error) {
            return error
        }
    }

    addLivestreamSpeaker = (livestreamId, speaker) => {
        let speakersRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("speakers");

        return speakersRef.add(speaker);
    }

    getLivestreamById = (livestreamId) => {
        let livestreamsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
        return livestreamsRef.get()
    }

    getStreamById = (streamId, collection) => {
        let livestreamsRef = this.firestore
            .collection(collection)
            .doc(streamId)
        return livestreamsRef.get()
    }

    getStreamSpeakers = (streamId, collection) => {
        let ref = this.firestore
            .collection(collection)
            .doc(streamId)
            .collection("speakers");
        return ref.get();
    };

    //TEST_LIVESTREAMS

    createTestLivestream = () => {
        let livestreamCollRef = this.firestore
            .collection("livestreams");

        return livestreamCollRef.add({
            companyId: 'CareerFairy',
            test: true,
            universities: [],
            start: firebase.firestore.Timestamp.fromDate(new Date('March 17, 2020 03:24:00'))
        });
    }

    setupTestLivestream = (livestreamId, testChats, testQuestions, testPolls) => {
        var batch = this.firestore.batch();
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        batch.update(livestreamRef, {
            currentSpeakerId: livestreamId
        });
        let chatsRef = livestreamRef
            .collection("chatEntries");
        testChats.forEach(chat => {
            let docRef = chatsRef.doc();
            batch.set(docRef, chat);
        });
        let questionsRef = livestreamRef
            .collection("questions");
        testQuestions.forEach(question => {
            let docRef = questionsRef.doc();
            batch.set(docRef, question);
        });
        let pollsRef = livestreamRef
            .collection("polls");
        testPolls.forEach(poll => {
            let docRef = pollsRef.doc();
            batch.set(docRef, poll);
        });
        return batch.commit();
    }
    resetTestStream = async (livestreamId, testChats, testQuestions, testPolls) => {

        let batch = this.firestore.batch();
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);

        // reset hand raise and current speaker
        batch.update(livestreamRef, {
            handRaiseActive: false,
            currentSpeakerId: livestreamId
        });

        // Declare all the refs
        let chatsRef = livestreamRef
            .collection("chatEntries");
        let questionsRef = livestreamRef
            .collection("questions");
        let pollsRef = livestreamRef
            .collection("polls");

        // Delete all existing docs
        // debugger
        const questionsDocs = await questionsRef.get()
        if (!questionsDocs.empty) {
            questionsDocs.forEach(doc => {
                let docRef = doc.ref
                batch.delete(docRef)
            })
        }

        const chatsDocs = await chatsRef.get()
        if (!chatsDocs.empty) {
            chatsDocs.forEach(doc => {
                let docRef = doc.ref
                batch.delete(docRef)
            })
        }

        const pollsDocs = await pollsRef.get()
        if (!pollsDocs.empty) {
            pollsDocs.forEach(doc => {
                let docRef = doc.ref
                batch.delete(docRef)
            })
        }

        // Add in the new Docs

        testQuestions.forEach(question => {
            let docRef = questionsRef.doc();
            batch.set(docRef, question);
        });

        testChats.forEach(chat => {
            let docRef = chatsRef.doc();
            batch.set(docRef, chat);
        });
        testPolls.forEach(poll => {
            let docRef = pollsRef.doc();
            batch.set(docRef, poll);
        });

        return batch.commit();
    }

    //SCHEDULED_LIVESTREAMS

    getScheduledLivestreamById = (livestreamId) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.get();
    };

    updateLivestreamCategories = (livestreamId, newCategories) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            targetCategories: newCategories,
        });
    }

    setMainStreamIdToLivestreamStreamers = (livestreamId, streamId) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            streamIds: [streamId],
        });
    };

    addStreamIdToLivestreamStreamers = (livestreamId, streamId) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            streamIds: firebase.firestore.FieldValue.arrayUnion(streamId),
        });
    };

    removeStreamIdFromLivestreamStreamers = (livestreamId, streamId) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            streamIds: firebase.firestore.FieldValue.arrayRemove(streamId),
        });
    };

    setLivestreamMode = (livestreamId, mode) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            mode: mode,
        });
    };

    setDesktopMode = (livestreamId, mode, screenSharerId) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            mode,
            screenSharerId
        });
    };

    setLivestreamSpeakerSwitchMode = (livestreamId, mode) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            speakerSwitchMode: mode,
        });
    };

    setLivestreamCurrentSpeakerId = (livestreamId, id) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            currentSpeakerId: id,
        });
    };

    setLivestreamPresentation = (livestreamId, downloadUrl) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("presentations")
            .doc("presentation");
        return ref.set({
            downloadUrl: downloadUrl,
            page: 1,
        });
    };

    increaseLivestreamPresentationPageNumber = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("presentations")
            .doc("presentation");
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(ref).then((presentation) => {
                transaction.update(ref, {
                    page: presentation.data().page + 1,
                });
            });
        });
    };

    decreaseLivestreamPresentationPageNumber = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("presentations")
            .doc("presentation");
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(ref).then((presentation) => {
                transaction.update(ref, {
                    page: presentation.data().page - 1,
                });
            });
        });
    };

    listenToLivestreamPresentation = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("presentations")
            .doc("presentation");
        return ref.onSnapshot(callback);
    };

    listenToScheduledLivestreamById = (livestreamId, callback) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.onSnapshot(callback);
    };

    listenToLiveStreamsByUniversityId = (universityId, callback) => {
        const currentTime = new Date();
        let ref = this.firestore
            .collection("livestreams")
            .where("universities", "array-contains", universityId)
            .where("start", ">", currentTime)
            .orderBy("start", "asc")
        return ref.onSnapshot(callback)
    }

    listenToUpcomingLiveStreamsByGroupId = (groupId, callback) => {
        var ninetyMinutesInMilliseconds = 1000 * 60 * 90;
        let ref = this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", groupId)
            .where("start", ">", new Date(Date.now() - ninetyMinutesInMilliseconds))
            .orderBy("start", "asc")
        return ref.onSnapshot(callback)
    }
//
    getUpcomingLiveStreamsByGroupId = (groupId) => {
        var ninetyMinutesInMilliseconds = 1000 * 60 * 90;
        let ref = this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", groupId)
            .where("start", ">", new Date(Date.now() - ninetyMinutesInMilliseconds))
            .orderBy("start", "asc")
        return ref.get()
    }

    queryUpcomingLiveStreamsByGroupId = (groupId) => {
        var ninetyMinutesInMilliseconds = 1000 * 60 * 90;
        return this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", groupId)
            .where("start", ">", new Date(Date.now() - ninetyMinutesInMilliseconds))
            .orderBy("start", "asc")
    }

    queryDraftLiveStreamsByGroupId = (groupId) => {
        return this.firestore
            .collection("draftLivestreams")
            .where("groupIds", "array-contains", groupId)
            .orderBy("start", "asc")
    }

    getDraftLiveStreamsByGroupId = (groupId) => {
        let ref = this.firestore
            .collection("draftLivestreams")
            .where("groupIds", "array-contains", groupId)
            .orderBy("start", "asc")
        return ref.get()
    }

    queryPastLiveStreamsByGroupId = (groupId) => {
        let START_DATE_FOR_REPORTED_EVENTS = 'September 1, 2020 00:00:00';
        const fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;
        return this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", groupId)
            .where("start", "<", new Date(Date.now() - fortyFiveMinutesInMilliseconds))
            .where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS))
            .orderBy("start", "desc")
    }
    //
    getPastLiveStreamsByGroupId = (groupId) => {
        let START_DATE_FOR_REPORTED_EVENTS = 'September 1, 2020 00:00:00';
        const fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;
        let ref = this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", groupId)
            .where("start", "<", new Date(Date.now() - fortyFiveMinutesInMilliseconds))
            .where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS))
            .orderBy("start", "desc")
        return ref.get()
    }

    getLivestreamSpeakers = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("speakers");
        return ref.get();
    };

    getLegacyScheduledLivestreamById = (livestreamId) => {
        let ref = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId);
        return ref.get();
    };

    listenToUpcomingLivestreamQuestions = (livestreamId) => {
        return this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .orderBy("type", "asc")
            .orderBy("votes", "desc")
            .orderBy("timestamp", "asc")
            .where("type", "!=", 'done')
    };

    listenToPastLivestreamQuestions = (livestreamId) => {
        return this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", 'done')
    };

    listLivestreamQuestions = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .orderBy("votes", "desc")
        return ref.onSnapshot(callback);
    };

    listenToQuestionComments = (livestreamId, questionId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(questionId)
            .collection("comments")
            .orderBy("timestamp", "asc");
        return ref.onSnapshot(callback);
    };

    putQuestionComment = (livestreamId, questionId, comment) => {
        comment.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(questionId)
            .collection("comments");
        return ref.add(comment);
    };

    putLivestreamQuestion = (livestreamId, question) => {
        question.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions");
        return ref.add(question);
    };

    upvoteLivestreamQuestion = (livestreamId, question, userEmail) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(ref).then((question) => {
                transaction.update(ref, {
                    votes: question.data().votes + 1,
                    emailOfVoters: firebase.firestore.FieldValue.arrayUnion(userEmail),
                });
            });
        });
    };

    listenToLivestreamCurrentQuestion = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "current");
        return ref.onSnapshot(callback);
    };

    putLivestreamComment = (livestreamId, comment) => {
        comment.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("comments");
        return ref.add(comment);
    };

    listenToChatEntries = (livestreamId, limit, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("chatEntries")
            .orderBy("timestamp", "desc")
            .limit(limit)
        return ref.onSnapshot(callback);
    }

    putChatEntry = (livestreamId, chatEntry) => {
        chatEntry.timestamp = this.getServerTimestamp()
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("chatEntries");
        return ref.add(chatEntry);
    }

    setLivestreamHasStarted = (hasStarted, livestreamId) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        const data = {
            hasStarted,
        }
        if (!hasStarted) {
            data.hasEnded = true
        }
        return ref.update(data);
    };

    getLivestreamCareerCenters = (universityIds) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false);
        return ref.get();
    }

    getDetailLivestreamCareerCenters = (groupIds) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false)
            .where("groupId", "in", groupIds);
        return ref.get();
    };


    getLegacyPastLivestreamQuestions = (livestreamId) => {
        let ref = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "done")
            .orderBy("timecode", "asc");
        return ref.get();
    };

    goToNextLivestreamQuestion = (
        previousCurrentQuestionId,
        newCurrentQuestionId,
        livestreamId
    ) => {
        let batch = this.firestore.batch();
        if (previousCurrentQuestionId) {
            let ref = this.firestore
                .collection("livestreams")
                .doc(livestreamId)
                .collection("questions")
                .doc(previousCurrentQuestionId);
            batch.update(ref, {type: "done"});
        }
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(newCurrentQuestionId);
        batch.update(ref, {type: "current"});
        batch.commit();
    };

    removeLivestreamQuestion = (livestreamId, question) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(ref).then((question) => {
                transaction.update(ref, {
                    type: "removed",
                });
            });
        });
    };

    getLivestreamRegisteredStudents = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("registeredStudents");
        return ref.get();
    }

    getLivestreamParticipatingStudents = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("participatingStudents");
        return ref.get();
    }

    getLivestreamTalentPoolMembers = (companyId) => {
        let ref = this.firestore
            .collection("userData")
            .where("talentPools", "array-contains", companyId);
        return ref.get();
    }

    deleteCareerCenter = (careerCenterId) => {
        let careerCenterRef = this.firestore
            .collection("careerCenterData")
            .doc(careerCenterId);
        return careerCenterRef.delete();
    };

    getCareerCenterById = (careerCenterId) => {
        let ref = this.firestore.collection("careerCenterData").doc(careerCenterId);
        return ref.get();
    };

    getCareerCenterByUniversityId = (universityId) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false)
            .where("universityId", "==", universityId);
        return ref.get();
    };

    listenToCareerCenterById = (groupId, callback) => {
        let ref = this.firestore.collection("careerCenterData").doc(groupId);
        return ref.onSnapshot(callback);
    };

    getAllCareerCenters = () => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false);
        return ref.get();
    };

    listenCareerCenters = (callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false);
        return ref.onSnapshot(callback);
    };
    getCareerCentersByGroupId = async (arrayOfIds) => {
        let groups = []
        for (const id of arrayOfIds) {
            const snapshot = await this.firestore.collection("careerCenterData").doc(id).get()
            if (snapshot.exists) {
                let group = snapshot.data()
                group.id = snapshot.id
                groups.push(group)
            }
        }
        return groups;
    };

    listenCareerCentersByAdminEmail = (email, callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("adminEmail", "==", email);
        return ref.onSnapshot(callback);
    };

    listenToJoinedGroups = (groupIds, callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("groupId", "in", groupIds);
        return ref.onSnapshot(callback);
    };

    getGroupCategoryElements = (groupId, categoryId) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("categories")
            .doc(categoryId)
            .collection("elements");
        return ref.get();
    };

    listenToGroupCategoryElements = (groupId, categoryId, callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("categories")
            .doc(categoryId)
            .collection("elements");
        return ref.onSnapshot(callback);
    };

    updateGroupCategoryElements = (groupId, newCategories) => {
        let groupRef = this.firestore.collection("careerCenterData").doc(groupId);
        return groupRef.update({categories: newCategories});
    };

    addGroupCategoryWithElements = (groupId, newCategoryObj) => {
        let groupRef = this.firestore.collection("careerCenterData").doc(groupId);

        return groupRef.update({
            categories: firebase.firestore.FieldValue.arrayUnion(newCategoryObj),
        });
    };

    addMultipleGroupCategoryWithElements = (groupId, arrayOfCategories) => {
        let batch = this.firestore.batch();

        arrayOfCategories.forEach((category) => {
            let categoryRef = this.firestore
                .collection("careerCenterData")
                .doc(groupId)
                .collection("categories");
            var newCategoryRef = categoryRef.doc();
            batch.set(newCategoryRef, {name: category.name});

            let elementsRef = this.firestore
                .collection("careerCenterData")
                .doc(groupId)
                .collection("categories")
                .doc(newCategoryRef.id)
                .collection("elements");
            category.options.forEach((option) => {
                var newElementRef = elementsRef.doc();
                batch.set(newElementRef, {name: option.name});
            });
        });
        return batch.commit();
    };

    rateLivestreamOverallQuality = (livestreamId, userEmail, rating) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc("overall")
            .collection("voters")
            .doc(userEmail);
        return ref.set({
            rating: rating,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        });
    }

    rateLivestream = (livestreamId, userEmail, rating, typeOfRating) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(typeOfRating)
            .collection("voters")
            .doc(userEmail);
        return ref.set({
            rating: rating,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        });
    }

    rateStreamingCompany = (livestreamId, userEmail, rating) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc("company")
            .collection("voters")
            .doc(userEmail);
        return ref.set({
            rating: rating,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        });
    }

    rateStreamWillingnessToApply = (livestreamId, userEmail, rating) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc("willingnessToApply")
            .collection("voters")
            .doc(userEmail);
        return ref.set({
            rating: rating,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        });
    }

    checkIfUserRated = async (livestreamId, userEmail, typeOfRating) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(typeOfRating)
            .collection("voters")
            .doc(userEmail);
        const docSnapshot = await ref.get()
        return docSnapshot.exists
    }

    createLivestreamPoll = (livestreamId, pollQuestion, pollOptions) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls");

        let pollObject = {
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            question: pollQuestion,
            options: [],
            voters: [],
            state: "upcoming",
        };
        pollOptions.forEach((option, index) => {
            pollObject.options.push({
                name: option,
                votes: 0,
                voters: [],
                index: index,
            });
        });
        return ref.add(pollObject);
    };

    updateLivestreamPoll = (livestreamId, pollId, pollQuestion, pollOptions) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls")
            .doc(pollId);

        let pollObject = {
            question: pollQuestion,
            options: [],
        };
        pollOptions.forEach((option, index) => {
            pollObject.options.push({
                name: option,
                votes: 0,
                voters: [],
                index: index,
            });
        });
        return ref.update(pollObject);
    };

    deleteLivestreamPoll = (livestreamId, pollId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls")
            .doc(pollId);
        return ref.delete();
    }

    listenToPollEntries = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls")
            .orderBy("timestamp", "asc");
        return ref.onSnapshot(callback);
    };

    listenToPollOptions = (livestreamId, pollId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls")
            .doc(pollId)
            .collection("options")
            .orderBy("index", "asc");
        return ref.onSnapshot(callback);
    };

    voteForPollOption = (livestreamId, pollId, userEmail, optionIndex) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls")
            .doc(pollId);
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(ref).then((pollDoc) => {
                let poll = pollDoc.data();
                const updatedOptions = poll.options.map((option, index) => {
                    if (index !== optionIndex) {
                        return option;
                    } else {
                        return {
                            name: option.name,
                            votes: option.votes ? option.votes + 1 : 1,
                            index: index,
                            voters: option.voters
                                ? [...option.voters, userEmail]
                                : [userEmail],
                        };
                    }
                });
                (poll.voters = firebase.firestore.FieldValue.arrayUnion(userEmail)),
                    (poll.options = updatedOptions);
                transaction.update(ref, poll);
            });
        });
    };

    setPollState = (livestreamId, pollId, state) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls")
            .doc(pollId);
        return ref.update({state: state});
    };

    listenToHandRaiseState = (livestreamId, userEmail, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("handRaises")
            .doc(userEmail);
        return ref.onSnapshot(callback);
    };

    listenToHandRaises = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("handRaises");
        return ref.onSnapshot(callback);
    };

    setHandRaiseMode = (livestreamId, mode) => {
        let ref = this.firestore.collection("livestreams").doc(livestreamId);
        return ref.update({
            handRaiseActive: mode,
        });
    };

    createHandRaiseRequest = (livestreamId, userEmail, userData) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("handRaises")
            .doc(userEmail);
        return ref.set({
            state: "requested",
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            name: userData.firstName + " " + userData.lastName,
        });
    };

    updateHandRaiseRequest = (livestreamId, userEmail, state) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("handRaises")
            .doc(userEmail);
        return ref.update({
            state: state,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        });
    };

    listenToPolls = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls");
        return ref.onSnapshot(callback);
    };

    getPastLivestreams = () => {
        let START_DATE_FOR_REPORTED_EVENTS = 'September 1, 2020 00:00:00';
        const fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;
        return this.firestore
            .collection("livestreams")
            .where("start", "<", new Date(Date.now() - fortyFiveMinutesInMilliseconds))
            .where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS))
            .where("test", "==", false)
            .orderBy("start", "desc")
            .get();
    };

    listenToUpcomingLivestreams = (callback) => {
        var fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;
        let ref = this.firestore
            .collection("livestreams")
            .where("start", ">", new Date(Date.now() - fortyFiveMinutesInMilliseconds))
            .orderBy("start", "asc");
        return ref.onSnapshot(callback);
    };

    registerToLivestream = (livestreamId, userId) => {
        let userRef = this.firestore.collection("userData").doc(userId);
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        let registeredUsersRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("registeredStudents")
            .doc(userId);
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(userRef).then((userDoc) => {
                const user = userDoc.data();
                transaction.update(livestreamRef, {
                    registeredUsers: firebase.firestore.FieldValue.arrayUnion(userId),
                });
                transaction.set(registeredUsersRef, user);
            });
        });
    };

    deregisterFromLivestream = (livestreamId, userId) => {
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        let registeredUsersRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("registeredStudents")
            .doc(userId);
        let batch = this.firestore.batch();
        batch.update(livestreamRef, {
            registeredUsers: firebase.firestore.FieldValue.arrayRemove(userId),
        });
        batch.delete(registeredUsersRef);
        return batch.commit();
    };

    joinCompanyTalentPool = (companyId, userId) => {
        let ref = this.firestore.collection("userData").doc(userId);
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(ref).then((user) => {
                transaction.update(ref, {
                    talentPools: firebase.firestore.FieldValue.arrayUnion(companyId),
                });
            });
        });
    };

    leaveCompanyTalentPool = (companyId, userId) => {
        let ref = this.firestore.collection("userData").doc(userId);
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(ref).then((company) => {
                transaction.update(ref, {
                    talentPools: firebase.firestore.FieldValue.arrayRemove(companyId),
                });
            });
        });
    };

    setUserIsParticipating = (livestreamId, userData) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("participatingStudents")
            .doc(userData.userEmail);
        return ref.set(userData);
    }

    getRegisteredStudentsInLivestream = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("registeredStudents");
        return ref.get();
    };

    getStudentsInCompanyTalentPool = (companyId) => {
        let ref = this.firestore
            .collection("userData")
            .where("talentPools", "array-contains", companyId);
        return ref.get();
    };

    postIcon = (livestreamId, iconName, authorEmail) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("icons");
        return ref.add({
            name: iconName,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            authorEmail: authorEmail,
        });
    };
//
    listenToLivestreamIcons = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("icons")
            .orderBy("timestamp", "desc")
            .limit(1)
        return ref.onSnapshot(callback);
    };

    listenToTotalLivestreamIcons = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("icons")
            .orderBy("timestamp", "desc");
        return ref.onSnapshot(callback);
    };

    listenToLivestreamIconCollection = (livestreamId, collection, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection(collection)
            .orderBy("timestamp", "desc")
            .limit(1)
        return ref.onSnapshot(callback);
    };

    listenToLivestreamOverallRatings = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc("overall")
            .collection("voters");
        return ref.onSnapshot(callback);
    };

    listenToLivestreamContentRatings = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc("company")
            .collection("voters");
        return ref.onSnapshot(callback);
    };

    getUniversitiesByCountry = (countryCode) => {
        let ref = this.firestore
            .collection("universitiesByCountry")
            .doc(countryCode)
        return ref.get();
    }

    // Analytics Queries
    listenToAllLivestreamsOfGroup = (groupId, callback, timeframe) => {
        const oneYear = 31536000000
        const oneYearAgo = new Date(Date.now() - oneYear)
        const maxDate = timeframe || oneYearAgo
        let ref = this.firestore
            .collection("livestreams")
            .where("start", ">", maxDate)
            .where("groupIds", "array-contains", groupId)
            .orderBy("start", "desc")
        return ref.onSnapshot(callback);
    }

    // listens to all followers of a group
    listenToFollowers = async (groupId, callback) => {
        let ref = this.firestore
            .collection("userData")
            .where("groupIds", "array-contains", groupId)
        return ref.onSnapshot(callback);
    };

    getFollowers = async (groupId) => {
        let ref = this.firestore
            .collection("userData")
            .where("groupIds", "array-contains", groupId)
        return ref.get();
    };
    queryFollowers = async (groupId) => {
        return  this.firestore
            .collection("userData")
            .where("groupIds", "array-contains", groupId)
    };

    snapShotsToData = (snapShots) => {
        let dataArray = []
        snapShots.forEach(doc => {
            const data = doc.data()
            data.id = doc.id
            dataArray.push(data)
        })
        return dataArray
    }


    getStorageRef = () => {
        return this.storage.ref();
    }

    getServerTimestamp = () => {
        return firebase.firestore.FieldValue.serverTimestamp()
    }

}

export default Firebase;
