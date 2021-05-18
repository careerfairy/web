import firebase from '../../Firebase/Firebase';
import {v4 as uuidv4} from 'uuid';
import {FORTY_FIVE_MINUTES_IN_MILLISECONDS, START_DATE_FOR_REPORTED_EVENTS} from "../constants/streamContants";

// import firebase from "firebase/app";
// import "firebase/auth";
// import "firebase/firestore";
// import "firebase/storage";
//
// const config = {
//     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//     databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
//     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
// };

class Firebase {
    constructor() {
        // if (!firebase.apps.length) {
        //     firebase.initializeApp(config);
        // }
        this.auth = firebase.auth();
        this.firestore = firebase.firestore();
        this.storage = firebase.storage();
        this.functions = firebase.functions()
        // if (process.env.NODE_ENV === 'development') {
        //     this.functions.useFunctionsEmulator('http://localhost:5001');
        // }
    }

    getFirebaseTimestamp = (dateString) => {
        return firebase.firestore.Timestamp.fromDate(new Date(dateString));
    };

    // *** Functions Api ***

    getPartnerFollowerData = async (requestingGroup, groups, streams, currentUserDataSet) => {
        const getGroupsAndTheirFollowers = this.functions.httpsCallable("getGroupsAndTheirFollowers")
        return await getGroupsAndTheirFollowers({requestingGroup, groups, streams, currentUserDataSet})
    }

    /**
     * Returns a promise containing the agora token object
     * @promise AgoraTokenPromise
     * @fulfill {({rtcToken: string, rtmToken: string})} A project object with the format {name: String, data: Object}
     * @reject {Error}
     * @returns fPromise
     */

    /**
     * Call an on call cloud function to generate a secure agora token.
     * @param {({
     * isStreamer: boolean,
     * uid: string,
     * sentToken: string,
     * channel: string,
     * streamDocumentPath: string,
     * })} data
     * @return {Promise<firebase.functions.HttpsCallableResult>}
     */
    getSecureAgoraToken = async (data) => {
        const getSecureAgoraToken = this.functions.httpsCallable("generateAgoraTokenSecureOnCall")
        return await getSecureAgoraToken(data)
    }

    createUserInAuthAndFirebase = async (userData) => {
        const createUserInAuthAndFirebase = this.functions.httpsCallable("createNewUserAccount")
        return createUserInAuthAndFirebase({userData})
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

    // *** Firestore API ***

    getStreamRef = (router) => {
        const {query: {breakoutRoomId, livestreamId}} = router
        if (!livestreamId) return {}
        let ref = this.firestore.collection("livestreams")
            .doc(livestreamId)
        if (breakoutRoomId) {
            ref = ref.collection("breakoutRooms")
                .doc(breakoutRoomId)
        }
        return ref
    }

    getBreakoutRoomRef = () => {

    }

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

    createCareerCenter = async (careerCenter, userEmail) => {
        let batch = this.firestore.batch();
        let groupRef = this.firestore.collection("careerCenterData")
            .doc()
        let groupAdminRef = this.firestore
            .collection("careerCenterData")
            .doc(groupRef.id)
            .collection("admins")
            .doc(userEmail)

        careerCenter.groupId = groupRef.id
        batch.set(groupRef, careerCenter)
        batch.set(groupAdminRef, {role: "mainAdmin"})

        await batch.commit();

        return groupRef
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

    addLivestream = async (livestream, collection, author = {}) => {
        try {
            const ratings = [
                {
                    message: `How happy are you with the content shared by ${livestream.company}?`,
                    type: "company",
                    appearAfter: 30,
                },
                {
                    message: `Are you more likely to apply to ${livestream.company} thanks to this live stream?`,
                    type: "willingnessToApply",
                    appearAfter: 40,
                },
                {
                    message: "How would you rate this live stream experience? Any feedback you would like to share?",
                    type: "overall",
                    appearAfter: 45,
                    hasText: true,
                },
            ]

            let batch = this.firestore.batch();
            let livestreamsRef = this.firestore
                .collection(collection)
                .doc()
            livestream.author = author
            livestream.created = this.getServerTimestamp()
            livestream.currentSpeakerId = livestreamsRef.id
            livestream.id = livestreamsRef.id
            batch.set(livestreamsRef, livestream, {merge: true})

            if (collection === 'livestreams') {
                let tokenRef = this.firestore.collection(collection)
                    .doc(livestreamsRef.id)
                    .collection('tokens')
                    .doc('secureToken');

                let token = uuidv4();
                batch.set(tokenRef, {
                    value: token,
                })
            }

            for (const rating of ratings) {
                let ratingRef = this.firestore.collection(collection)
                    .doc(livestreamsRef.id)
                    .collection("rating")
                    .doc(rating.type)

                batch.set(ratingRef, {
                    title: rating.type,
                    question: rating.message,
                    appearAfter: rating.appearAfter,
                    hasText: Boolean(rating.hasText)
                })
            }

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
        livestream.created = this.getServerTimestamp()
        batch.set(livestreamsRef, livestream)
        await batch.commit()
        return livestreamsRef.id
    }

    updateLivestream = async (livestream, collection) => {
        let livestreamsRef = this.firestore
            .collection(collection)
            .doc(livestream.id)
        livestream.lastUpdated = this.getServerTimestamp()
        await livestreamsRef.update(livestream)
        return livestream.id
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

    setLivestreamMode = (streamRef, mode) => {
        return streamRef.update({
            mode: mode,
        });
    };

    setDesktopMode = (streamRef, mode, screenSharerId) => {
        return streamRef.update({
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

    setLivestreamCurrentSpeakerId = (streamRef, id) => {
        return streamRef.update({
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
            .where("test", "==", false)
            .where("start", ">", currentTime)
            .orderBy("start", "asc")
        return ref.onSnapshot(callback)
    }

    listenToUpcomingLiveStreamsByGroupId = (groupId, callback) => {
        var ninetyMinutesInMilliseconds = 1000 * 60 * 90;
        let ref = this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", groupId)
            .where("test", "==", false)
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
            .where("test", "==", false)
            .where("start", ">", new Date(Date.now() - ninetyMinutesInMilliseconds))
            .orderBy("start", "asc")
        return ref.get()
    }

    queryUpcomingLiveStreamsByGroupId = (groupId) => {
        var ninetyMinutesInMilliseconds = 1000 * 60 * 90;
        return this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", groupId)
            .where("test", "==", false)
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

    listenToDraftLiveStreamsByGroupId = (groupId, callback) => {
        let ref = this.firestore
            .collection("draftLivestreams")
            .where("groupIds", "array-contains", groupId)
            .orderBy("start", "asc")
        return ref.onSnapshot(callback)
    }

    queryPastLiveStreamsByGroupId = (groupId) => {
        let START_DATE_FOR_REPORTED_EVENTS = 'September 1, 2020 00:00:00';
        const fortyFiveMinutesInMilliseconds = 1000 * 60 * 45;
        return this.firestore
            .collection("livestreams")
            .where("groupIds", "array-contains", groupId)
            .where("test", "==", false)
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
            .where("test", "==", false)
            .where("groupIds", "array-contains", groupId)
            .where("start", "<", new Date(Date.now() - fortyFiveMinutesInMilliseconds))
            .where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS))
            .orderBy("start", "desc")
        return ref.get()
    }

    listenToPastLiveStreamsByGroupId = (groupId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .where("test", "==", false)
            .where("groupIds", "array-contains", groupId)
            .where("start", "<", new Date(Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS))
            .where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS))
            .orderBy("start", "desc")
        return ref.onSnapshot(callback)
    }

    getLivestreamSpeakers = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("speakers");
        return ref.get();
    };

    getLivestreamSecureToken = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("tokens")
            .doc("secureToken");
        return ref.get();
    }
    getLivestreamSecureTokenWithRef = (streamRef) => {
        let ref = streamRef
            .collection("tokens")
            .doc("secureToken");
        return ref.get();
    }

    getBreakoutRoomSecureToken = (livestreamId, breakoutRoomId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("breakoutRooms")
            .doc(breakoutRoomId)
            .collection("tokens")
            .doc("secureToken");
        return ref.get();
    }

    getLegacyScheduledLivestreamById = (livestreamId) => {
        let ref = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId);
        return ref.get();
    };

    listenToUpcomingLivestreamQuestions = (streamRef) => {
        return streamRef
            .collection("questions")
            .orderBy("type", "asc")
            .orderBy("votes", "desc")
            .orderBy("timestamp", "asc")
            .where("type", "!=", 'done')
    };

    listenToPastLivestreamQuestions = (streamRef) => {
        return streamRef
            .collection("questions")
            .where("type", "==", 'done')
    };

    listenToLivestreamQuestions = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .orderBy("votes", "desc")
        return ref.onSnapshot(callback);
    };

    listenToQuestionComments = (streamRef, questionId, callback) => {
        let ref = streamRef
            .collection("questions")
            .doc(questionId)
            .collection("comments")
            .orderBy("timestamp", "asc");
        return ref.onSnapshot(callback);
    };

    updateSpeakersInLivestream = (livestreamRef, speaker) => {
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(livestreamRef).then((livestreamDoc) => {
                let livestream = livestreamDoc.data()
                let updatedSpeakers = livestream.liveSpeakers?.filter(existingSpeaker => existingSpeaker.id !== speaker.id) || [];
                if (updatedSpeakers && updatedSpeakers.length > 0) {
                    updatedSpeakers.forEach(existingSpeaker => {
                        if (existingSpeaker.speakerUuid === speaker.speakerUuid) {
                            delete existingSpeaker.speakerUuid;
                        }
                    });
                }
                updatedSpeakers.push(speaker)
                transaction.update(livestreamRef, {
                    liveSpeakers: updatedSpeakers
                });
            });
        });
    }

    addSpeakerInLivestream = (livestreamRef, speaker) => {
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(livestreamRef).then((livestreamDoc) => {
                let livestream = livestreamDoc.data()
                let speakerRef = livestreamRef.collection("speakers").doc();
                speaker.id = speakerRef.id;
                let updatedSpeakers = livestream.liveSpeakers ? [...livestream.liveSpeakers] : []
                updatedSpeakers.forEach(existingSpeaker => {
                    if (existingSpeaker.speakerUuid === speaker.speakerUuid) {
                        delete existingSpeaker.speakerUuid;
                    }
                });
                updatedSpeakers.push(speaker)
                transaction.update(livestreamRef, {
                    liveSpeakers: updatedSpeakers
                });
            });
        });
    }

    putQuestionComment = (streamRef, questionId, comment) => {
        let ref = streamRef
            .collection("questions")
            .doc(questionId)
            .collection("comments");
        return ref.add({...comment, timestamp: this.getServerTimestamp()});
    };

    putQuestionCommentWithTransaction = async (livestreamRef, questionId, comment) => {
        let questionRef = livestreamRef
            .collection("questions")
            .doc(questionId);
        let commentRef = livestreamRef
            .collection("questions")
            .doc(questionId)
            .collection("comments")
            .doc()
        const newComment = {...comment, id: commentRef.id, timestamp: this.getServerTimestamp()}

        return this.firestore.runTransaction((transaction) => {
            return transaction.get(questionRef).then((question) => {
                if (question.exists) {
                    const questionData = question.data()
                    const questionDataToUpdate = {
                        numberOfComments: firebase.firestore.FieldValue.increment(1),
                    }
                    if (!questionData.firstComment) {
                        questionDataToUpdate.firstComment = newComment
                    }
                    transaction.update(questionRef, questionDataToUpdate);
                    transaction.set(commentRef, newComment)
                }
            });
        });
    };

    putLivestreamQuestion = (livestreamId, question) => {
        question.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions");
        return ref.add(question);
    };

    addLivestreamQuestion = (streamRef, question) => {
        question.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let ref = streamRef
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

    upvoteLivestreamQuestionWithRef = (streamRef, question, userEmail) => {
        let ref = streamRef
            .collection("questions")
            .doc(question.id);
        return ref.update({
            votes: firebase.firestore.FieldValue.increment(1),
            emailOfVoters: firebase.firestore.FieldValue.arrayUnion(userEmail),
        })
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

    listenToChatEntries = (streamRef, limit, callback) => {
        let ref = streamRef
            .collection("chatEntries")
            .limit(limit)
            .orderBy("timestamp", "desc")
        return ref.onSnapshot(callback);
    }

    putChatEntry = (streamRef, chatEntry) => {
        chatEntry.timestamp = this.getServerTimestamp()
        const newChatEntry = {
            ...chatEntry,
            laughing: [],
            wow: [],
            heart: [],
            thumbsUp: []
        }
        let ref = streamRef
            .collection("chatEntries");
        return ref.add(newChatEntry);
    }

    emoteComment = (streamRef, chatEntryId, fieldProp, userEmail) => {
        const otherProps = ["wow", "laughing", "heart", "thumbsUp"].filter(prop => prop !== fieldProp)
        const chatEntryRef = streamRef
            .collection("chatEntries")
            .doc(chatEntryId)
        const data = {
            [fieldProp]: firebase.firestore.FieldValue.arrayUnion(userEmail)
        }
        otherProps.forEach(otherProp => {
            data[otherProp] = firebase.firestore.FieldValue.arrayRemove(userEmail)
        })
        return chatEntryRef.update(data)
    }
    unEmoteComment = (streamRef, chatEntryId, fieldProp, userEmail) => {
        const chatEntryRef = streamRef
            .collection("chatEntries")
            .doc(chatEntryId)
        return chatEntryRef.update({
            [fieldProp]: firebase.firestore.FieldValue.arrayRemove(userEmail)
        })
    }

    setLivestreamHasStarted = (hasStarted, streamRef) => {
        const data = {
            hasStarted,
        }
        if (!hasStarted) {
            data.hasEnded = true
        }
        return streamRef.update(data);
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
        streamRef
    ) => {
        let batch = this.firestore.batch();
        if (previousCurrentQuestionId) {
            let ref = streamRef
                .collection("questions")
                .doc(previousCurrentQuestionId);
            batch.update(ref, {type: "done"});
        }
        let ref = streamRef
            .collection("questions")
            .doc(newCurrentQuestionId);
        batch.update(ref, {type: "current"});
        return batch.commit();
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
    listenToLivestreamParticipatingStudents = (livestreamId, callback) => {
        const now = new Date()
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("participatingStudents")
            .where("joined", ">", now)
            .orderBy("joined", "asc")
            .limit(1)
        return ref.onSnapshot(callback);
    }

    listenToAllLivestreamParticipatingStudents = (streamRef, callback) => {
        let ref = streamRef
            .collection("participatingStudents")
        return ref.onSnapshot(callback);
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

    getGroupsByGroupId = async (arrayOfIds = [""]) => {
        let groups = []
        let i, j, temparray, chunk = 10;
        for (i = 0, j = arrayOfIds.length; i < j; i += chunk) {
            temparray = arrayOfIds.slice(i, i + chunk);
            const snapshots = await this.firestore.collection("careerCenterData").where('groupId', 'in', temparray).get()
            const snapGroups = snapshots.docs.map(doc => ({id: doc.id, ...doc.data()}))
            groups = [...groups, ...snapGroups]
        }
        return groups;
    };

    getUsersByEmailInBatches = async (arrayOfEmails = [""]) => {
        let totalUsers = []
        let i, j, temparray, chunk = 10;
        for (i = 0, j = arrayOfEmails.length; i < j; i += chunk) {
            temparray = arrayOfEmails.slice(i, i + chunk);
            const userEmailSnaps = await this.firestore.collection("userData").where('userEmail', 'in', temparray).get()
            const newUsers = userEmailSnaps.docs.map(doc => ({id: doc.id, ...doc.data()}))
            totalUsers = [...totalUsers, ...newUsers]
        }
        return totalUsers;
    };

    /**
     * Get firestore users from an array of emails.
     * @param {Array<string>} arrayOfEmails – Array of email strings
     * @param {({withEmpty: boolean})} options – Config object for the method
     * @return {Array<Object>} Returns the image url with the correct size appended to it.
     */
    getUsersByEmail = async (arrayOfEmails = [], options = {withEmpty: false}) => {
        let totalUsers = []
        let i, j, tempArray, chunk = 800;
        for (i = 0, j = arrayOfEmails.length; i < j; i += chunk) {
            tempArray = arrayOfEmails.slice(i, i + chunk);
            // console.log("-> tempArray", tempArray);
            const userSnaps = await Promise.all(tempArray.map(email => this.firestore.collection("userData").doc(email).get()))
            let newUsers;
            if (options.withEmpty) {
                newUsers = userSnaps.map(doc => ({id: doc.id, ...doc.data()}))
            } else {
                newUsers = userSnaps.filter(doc => doc.exists).map(doc => ({id: doc.id, ...doc.data()}))
            }
            totalUsers = [...totalUsers, ...newUsers]
        }
        return totalUsers
    };

    getFollowingGroups = async (groupIds = []) => {
        const uniqueGroupIds = [...new Set(groupIds)]
        const groupSnaps = await Promise.all(uniqueGroupIds.map(groupId => this.firestore.collection("careerCenterData").doc(groupId).get()))
        return groupSnaps.filter(doc => doc.exists).map(doc => ({id: doc.id, ...doc.data()}))
    }


    listenCareerCentersByAdminEmail = (email, callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("adminEmails", "array-contains", email);
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

    rateLivestream = (livestreamId, userEmail, rating, ratingId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(ratingId)
            .collection("voters")
            .doc(userEmail);
        return ref.set({
            ...rating,
            timestamp: this.getServerTimestamp(),
        });
    }

    optOutOfRating = (livestreamId, userEmail, ratingId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(ratingId)
            .collection("nonVoters")
            .doc(userEmail);
        return ref.set({
            timestamp: this.getServerTimestamp(),
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
        try {
            let voterInVotersRef = this.firestore
                .collection("livestreams")
                .doc(livestreamId)
                .collection("rating")
                .doc(typeOfRating)
                .collection("voters")
                .doc(userEmail);
            let voterInNonVotersRef = this.firestore
                .collection("livestreams")
                .doc(livestreamId)
                .collection("rating")
                .doc(typeOfRating)
                .collection("nonVoters")
                .doc(userEmail);
            const voterInVotersSnap = await voterInVotersRef.get()
            const voterInNonVotersSnap = await voterInNonVotersRef.get()
            return voterInVotersSnap.exists || voterInNonVotersSnap.exists
        } catch (e) {
            console.log("-> e", e);
        }

    }

    createLivestreamPoll = (streamRef, pollQuestion, pollOptions) => {
        let ref = streamRef
            .collection("polls");
        let pollObject = {
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            question: pollQuestion,
            options: pollOptions,
            voters: [],
            state: "upcoming",
        };

        return ref.add(pollObject);
    };

    updateLivestreamPoll = (streamRef, pollId, pollQuestion, pollOptions) => {
        let ref = streamRef
            .collection("polls")
            .doc(pollId);
        let pollObject = {
            question: pollQuestion,
            options: pollOptions,
        };
        return ref.update(pollObject);
    };

    listenToPollVoters = (livestreamId, pollId, callback) => {
        const pollVotersRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls")
            .doc(pollId)
            .collection("voters")
        return pollVotersRef.onSnapshot(callback);
    }
    listenToPollVotersWithStreamRef = (streamRef, pollId, callback) => {
        const pollVotersRef = streamRef
            .collection("polls")
            .doc(pollId)
            .collection("voters")
        return pollVotersRef.onSnapshot(callback);
    }

    listenToVoteOnPoll = (streamRef, pollId, authEmail, callback) => {
        const pollVotersRef = streamRef
            .collection("polls")
            .doc(pollId)
            .collection("voters")
            .doc(authEmail)
        return pollVotersRef.onSnapshot(callback);
    }

    checkIfHasVotedOnPoll = async (livestreamId, pollId, authEmail) => {
        const pollVoterRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("polls")
            .doc(pollId)
            .collection("voters")
            .doc(authEmail)
        const voterSnap = await pollVoterRef.get()
        return voterSnap.exists
    }

    deleteLivestreamPoll = (streamRef, pollId) => {
        let ref = streamRef
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
    listenToPollEntriesWithStreamRef = (streamRef, callback) => {
        let ref = streamRef
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

    voteForPollOption = (streamRef, pollId, userEmail, optionId) => {
        let pollRef = streamRef
            .collection("polls")
            .doc(pollId)
            .collection("voters")
            .doc(userEmail)
        return pollRef.set({
            optionId: optionId,
            timestamp: this.getServerTimestamp()
        })

        // return pollRef.update({
        //     [`options.${optionIndex}.votes`]: firebase.firestore.FieldValue.increment(1),
        //     [`options.${optionIndex}.voters`]: firebase.firestore.FieldValue.arrayUnion(userEmail),
        //     voters: firebase.firestore.FieldValue.arrayUnion(userEmail)
        // })
    };

    setPollState = (streamRef, pollId, state) => {
        let ref = streamRef
            .collection("polls")
            .doc(pollId);
        return ref.update({state: state});
    };

    listenToHandRaiseState = (streamRef, userEmail, callback) => {
        let ref = streamRef
            .collection("handRaises")
            .doc(userEmail);
        return ref.onSnapshot(callback);
    };

    listenToHandRaises = (streamRef, callback) => {
        let ref = streamRef
            .collection("handRaises");
        return ref.onSnapshot(callback);
    };

    setHandRaiseMode = (streamRef, mode) => {
        return streamRef.update({
            handRaiseActive: mode,
        });
    };

    createHandRaiseRequest = (streamRef, userEmail, userData) => {
        let ref = streamRef
            .collection("handRaises")
            .doc(userEmail);
        return ref.set({
            state: "requested",
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
            name: userData.firstName + " " + userData.lastName,
        });
    };

    updateHandRaiseRequest = (streamRef, userEmail, state) => {
        let ref = streamRef
            .collection("handRaises")
            .doc(userEmail);
        return ref.update({
            state: state,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        });
    };

    listenToPolls = (streamRef, callback) => {
        let ref = streamRef
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
            .where("test", "==", false)
            .orderBy("start", "asc");
        return ref.onSnapshot(callback);
    };

    registerToLivestream = (livestreamId, userId, groupsWithPolicies = []) => {
        const idsOfGroupsWithPolicies = groupsWithPolicies.map(group => group.id)
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

                for (const groupId of idsOfGroupsWithPolicies) {
                    let userInPolicyRef = this.firestore
                        .collection("careerCenterData")
                        .doc(groupId)
                        .collection("usersInPolicy")
                        .doc(userId)
                    transaction.set(userInPolicyRef, user)
                }

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

    joinCompanyTalentPool = (companyId, userId, mainStreamId) => {
        let userRef = this.firestore.collection("userData").doc(userId);
        let streamRef = this.firestore.collection("livestreams").doc(mainStreamId)
        let userInTalentPoolCollectionRef = this.firestore.collection("livestreams")
            .doc(mainStreamId)
            .collection("talentPool")
            .doc(userId)

        return this.firestore.runTransaction((transaction) => {
            return transaction.get(userRef).then((userSnap) => {
                if (userSnap.exists) {
                    const userData = userSnap.data()
                    transaction.update(userRef, {
                        talentPools: firebase.firestore.FieldValue.arrayUnion(companyId),
                    });
                    transaction.update(streamRef, {
                        talentPool: firebase.firestore.FieldValue.arrayUnion(userId),
                    });
                    transaction.set(userInTalentPoolCollectionRef, userData)
                }
            });
        });
    };

    getLivestreamCompanyId = async (livestreamId) => {
        const livestreamRef = this.firestore.collection("livestreams")
            .doc(livestreamId)
        const streamSnap = await livestreamRef.get()
        if (!streamSnap.exists) {
            return ""
        }
        const streamData = streamSnap.data()
        return streamData.companyId

    }

    leaveCompanyTalentPool = (companyId, userId, livestreamId) => {
        let batch = this.firestore.batch();
        let userRef = this.firestore.collection("userData").doc(userId);
        let streamRef = this.firestore.collection("livestreams").doc(livestreamId)
        let userInTalentPoolCollectionRef = this.firestore.collection("livestreams")
            .doc(livestreamId)
            .collection("talentPool")
            .doc(userId)
        batch.update(userRef, {
            talentPools: firebase.firestore.FieldValue.arrayRemove(companyId),
        });
        batch.update(streamRef, {
            talentPool: firebase.firestore.FieldValue.arrayRemove(userId),
        });

        batch.delete(userInTalentPoolCollectionRef)

        return batch.commit()
    };

    listenToUserInTalentPool = (livestreamId, userId, callback) => {
        const userTalentPoolRef = this.firestore.collection("livestreams")
            .doc(livestreamId)
            .collection("talentPool")
            .doc(userId)
        return userTalentPoolRef.onSnapshot(callback)
    }

    setUserIsParticipating = (livestreamId, userData) => {
        let batch = this.firestore.batch()
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
        let participantsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("participatingStudents")
            .doc(userData.userEmail)

        batch.set(participantsRef, {
            ...userData,
            joined: this.getServerTimestamp()
        })
        batch.update(livestreamRef, {
            participatingStudents: firebase.firestore.FieldValue.arrayUnion(userData.userEmail),
        })

        return batch.commit();
    }
    setUserIsParticipatingWithRef = (streamRef, userData) => {
        let batch = this.firestore.batch()
        let participantsRef = streamRef
            .collection("participatingStudents")
            .doc(userData.userEmail)

        batch.set(participantsRef, {
            ...userData,
            joined: this.getServerTimestamp()
        })
        batch.update(streamRef, {
            participatingStudents: firebase.firestore.FieldValue.arrayUnion(userData.userEmail),
        })
        return batch.commit();
    }

    checkIfUserAgreedToGroupPolicy = async (groupId, userEmail) => {
        let userInPolicySnapshot = await this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("usersInPolicy")
            .doc(userEmail)
            .get()
        return !userInPolicySnapshot.exists
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
            .where("test", "==", false)
            .where("start", ">", maxDate)
            .where("groupIds", "array-contains", groupId)
            .orderBy("start", "desc")
        return ref.onSnapshot(callback);
    }

    updateFeedbackQuestion = async (livestreamId, feedbackId, data) => {
        let feedbackRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(feedbackId)
        return feedbackRef.update(data)
    }

    deleteFeedbackQuestion = async (livestreamId, feedbackId) => {
        let feedbackRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(feedbackId)
        return feedbackRef.delete()
    }

    createFeedbackQuestion = async (livestreamId, data) => {
        let feedbackRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
        return feedbackRef.add(data)
    }

    listenToLivestreamRatings = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
        return ref.onSnapshot(callback)
    };
    listenToLivestreamRatingsWithStreamRef = (streamRef, callback) => {
        let ref = streamRef
            .collection("rating")
        return ref.onSnapshot(callback)
    };

    getLivestreamRatingVoters = (ratingId, livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(ratingId)
            .collection("voters")
        return ref.get()
    };

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

    getStudentsOfGroupUniversity = async (groupUniversityCode) => {
        let ref = this.firestore
            .collection("userData")
            .where("universityCode", "==", groupUniversityCode)
        return ref.get();
    }

    queryFollowers = async (groupId) => {
        return this.firestore
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

    //Dashboard Queries

    joinGroupDashboard = (groupId, userEmail, invitationId) => {
        let groupRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)

        let userRef = this.firestore
            .collection("userData")
            .doc(userEmail)

        let notificationRef = this.firestore
            .collection("notifications")
            .doc(invitationId)

        return this.firestore.runTransaction((transaction) => {
            return transaction.get(userRef).then((userDoc) => {
                const userData = userDoc.data()
                transaction.update(groupRef, {
                    adminEmails: firebase.firestore.FieldValue.arrayUnion(userData.userEmail),
                });
                let groupAdminRef = this.firestore
                    .collection("careerCenterData")
                    .doc(groupId)
                    .collection("admins")
                    .doc(userData.userEmail)
                transaction.set(groupAdminRef, {
                    role: "subAdmin",
                });

                transaction.delete(notificationRef)
            });
        });
    }

    kickFromDashboard = (groupId, userEmail) => {
        let groupRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)

        let userRef = this.firestore
            .collection("userData")
            .doc(userEmail)

        return this.firestore.runTransaction((transaction) => {
            return transaction.get(userRef).then((userDoc) => {
                const userData = userDoc.data()

                const email = userData?.userEmail || userEmail

                transaction.update(groupRef, {
                    adminEmails: firebase.firestore.FieldValue.arrayRemove(email),
                });
                let groupAdminRef = this.firestore
                    .collection("careerCenterData")
                    .doc(groupId)
                    .collection("admins")
                    .doc(email)
                transaction.delete(groupAdminRef);
            });
        });
    }

    promoteToMainAdmin = async (groupId, userEmail) => {

        let batch = this.firestore.batch()

        let adminToPromoteRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("admins")
            .doc(userEmail)

        let groupAdminsRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("admins")
            .where("role", "==", "mainAdmin")

        const adminSnaps = await groupAdminsRef.get()
        // Demote all main Admins to subAdmins to ensure that there is always no main admins when promoting
        for (const mainAdminDoc of adminSnaps.docs) {
            const mainAdminRef = this.firestore
                .collection("careerCenterData")
                .doc(groupId)
                .collection("admins")
                .doc(mainAdminDoc.id)
            batch.update(mainAdminRef, {role: "subAdmin"})
        }

        batch.set(adminToPromoteRef, {role: "mainAdmin"}, {merge: true})

        return batch.commit()
    }

    // Approval Queries

    getAllGroupAdminInfo = async (arrayOfGroupIds = ["groupId"], streamId = "") => {
        let adminsInfo = []
        for (const groupId of arrayOfGroupIds) {
            const groupRef = this.firestore.collection("careerCenterData")
                .doc(groupId)
            const groupSnap = await groupRef.get()
            if (groupSnap.exists) {
                const groupData = groupSnap.data()
                if (groupData.adminEmails?.length) {
                    const baseUrl = this.getBaseUrl()
                    const newAdminsInfo = groupData.adminEmails.map(email => ({
                        groupId,
                        email,
                        link: `${baseUrl}/group/${groupId}/admin/drafts?livestreamId=${streamId}`
                    }))
                    adminsInfo = [...adminsInfo, ...newAdminsInfo]
                }
            }
        }
        return adminsInfo
    }


    // Notification Queries
    createNotification = async (details, options = {force: false}) => {
        const prevNotification = await this.checkForNotification(details)
        if (!prevNotification.empty && options.force === true) {
            const prevNotificationData = prevNotification.docs.map(doc => ({id: doc.id}))
            const notificationId = prevNotificationData[0].id
            if (options.force === true) {
                return await this.updateNotification(notificationId, details)
            }
            return throw `Notification Already Exists as document ${notificationId}`
        }
        let ref = this.firestore.collection("notifications");
        const newNotification = {
            details: details,
            open: true,
            created: this.getServerTimestamp()
        }
        return ref.add(newNotification);
    }

    updateNotification = async (notificationId, details, open = true) => {
        const newNotification = {
            details,
            open,
            updated: this.getServerTimestamp()
        }
        let ref = this.firestore.collection("notifications")
            .doc(notificationId)
        await ref.set(newNotification, {merge: true});
        return {id: notificationId}
    }

    deleteNotification = async (notificationId) => {
        const notificationRef = this.firestore.collection("notifications")
            .doc(notificationId)
        await notificationRef.delete()
    }

    validateDashboardInvite = async (notificationId, groupId) => {
        let ref = this.firestore.collection("notifications")
            .doc(notificationId)
        const refSnap = await ref.get()
        if (!refSnap.exists) {
            return false
        }
        const notification = refSnap.data()
        return notification.details.type === "dashboardInvite" && notification.open && notification.details.requester === groupId
    }

    getNotification = (notificationId) => {
        let ref = this.firestore.collection("notifications")
            .doc(notificationId)
        return ref.get()
    }

    checkForNotification = (detailFieldsToCheck = {property1: "value1", property2: "property2"}) => {
        let query = this.firestore.collection("notifications")
            .where("details", "==", detailFieldsToCheck)
            .limit(1)

        return query.get()
    }

    getStreamTokenWithRef = (streamRef) => {
        return streamRef.collection('tokens')
            .doc('secureToken')
            .get()
    }

    // Breakout Rooms

    /**
     * @param {string} mainStreamId
     * @param {function} callback
     */
    listenToBreakoutRoomSettings = (mainStreamId, callback) => {
        const settingsRef = this.firestore.collection("livestreams")
            .doc(mainStreamId)
            .collection("breakoutRoomsSettings")
            .doc("breakoutRoomsSetting")
        return settingsRef.onSnapshot(callback)
    }

    /**
     * @param {string} mainStreamId
     * @param {boolean} canReturnToMainStream
     */
    updateCanReturnToMainStream = (mainStreamId, canReturnToMainStream) => {
        const settingsRef = this.firestore.collection("livestreams")
            .doc(mainStreamId)
            .collection("breakoutRoomsSettings")
            .doc("breakoutRoomsSetting")

        return settingsRef.set({
            canReturnToMainStream: canReturnToMainStream
        }, {merge: true})
    }

    /**
     * @param {firebase.firestore.UpdateData|string} newData
     * @param {string} roomId
     * @param {string} mainStreamId
     */
    updateBreakoutRoom = (newData, roomId, mainStreamId) => {
        const breakoutRoomRef = this.firestore.collection("livestreams")
            .doc(mainStreamId)
            .collection("breakoutRooms")
            .doc(roomId)
        return breakoutRoomRef.update(newData)
    }

    /**
     * @param {string} title
     * @param {string} mainStreamId
     */
    addBreakoutRoom = (title, mainStreamId) => {
        const livestreamRef = this.firestore.collection("livestreams").doc(mainStreamId)
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(livestreamRef).then((livestreamSnap) => {
                const livestreamData = livestreamSnap.data()
                const isTestStream = livestreamData.test
                const companyLogo = livestreamData.companyLogoUrl || ""
                    const breakoutRoomRef = livestreamRef.collection("breakoutRooms").doc()
                    const newBreakoutRoom = this.buildBreakoutRoom(breakoutRoomRef.id, isTestStream, title, companyLogo)
                    transaction.set(breakoutRoomRef, newBreakoutRoom)
                    if (!isTestStream) {
                        // If the main stream isn't a test, we will then need secure tokens for each breakout room
                        const breakoutTokenRef = breakoutRoomRef.collection("tokens")
                            .doc("secureToken");
                        const token = uuidv4();
                        transaction.set(breakoutTokenRef, {
                            value: token,
                        })
                    }
            });
        });
    }

    /**
     * @param {string} roomId
     * @param {string} mainStreamId
     */
    deleteBreakoutRoom = (roomId, mainStreamId) => {
        const breakoutRoomRef = this.firestore.collection("livestreams")
            .doc(mainStreamId)
            .collection("breakoutRooms")
            .doc(roomId)
        return breakoutRoomRef.delete()
    }

    /**
     * @param {string} mainStreamId
     */
    openAllBreakoutRooms = async (mainStreamId) => {
        const batch = this.firestore.batch()
        const breakoutRoomsSnaps = await this.firestore.collection("livestreams")
            .doc(mainStreamId)
            .collection("breakoutRooms").get()
        for (const breakoutRoomSnap of breakoutRoomsSnaps.docs) {
            if (breakoutRoomSnap.exists) {
                const roomRef = breakoutRoomSnap.ref
                batch.update(roomRef, {
                    hasStarted: true
                })
            }
        }
        return await batch.commit()
    }

    /**
     * @param {string} mainStreamId
     */
    closeAllBreakoutRooms = async (mainStreamId) => {
        const batch = this.firestore.batch()
        const breakoutRoomsSnaps = await this.firestore.collection("livestreams")
            .doc(mainStreamId)
            .collection("breakoutRooms").get()
        for (const breakoutRoomSnap of breakoutRoomsSnaps.docs) {
            if (breakoutRoomSnap.exists) {
                const roomRef = breakoutRoomSnap.ref
                batch.update(roomRef, {
                    hasStarted: false,
                    hasEnded: true
                })
            }
        }
        return await batch.commit()
    }

    buildBreakoutRoom = (breakoutRoomId, test, title, companyLogo, index) => {
        return {
            start: this.getServerTimestamp(),
            id: breakoutRoomId,
            hasStarted: false,
            test,
            companyLogo,
            title,
            ...(index && {index: index})
        }
    }

    getUsersByIdsWithCache = async (arrayOfUserIds = []) => {
        const getOptions = {
            source: 'cache'
        };
        let totalUsers = []
        let i, j, tempArray, chunk = 800;
        for (i = 0, j = arrayOfUserIds.length; i < j; i += chunk) {
            tempArray = arrayOfUserIds.slice(i, i + chunk);
            const userSnaps = await Promise.all(tempArray.map(email => this.firestore.collection("userData").doc(email).get(getOptions)))
            const arrayOfIdsToCheckOnline = []
            let newUserData = []
            for (const cachedUserSnap of userSnaps) {
                if (!cachedUserSnap.exists) {
                    arrayOfIdsToCheckOnline.push(cachedUserSnap.id)
                } else {
                    newUserData.push({id: cachedUserSnap.id, ...cachedUserSnap.data()})
                }
            }
            if (arrayOfIdsToCheckOnline.length) {
                const userSnaps = await Promise.all(arrayOfIdsToCheckOnline.map(email => this.firestore.collection("userData").doc(email).get()))
                const newUsers = userSnaps.filter(doc => doc.exists).map(doc => ({id: doc.id, ...doc.data()}))
                newUserData = [...newUserData, ...newUsers]

            }
            totalUsers = [...totalUsers, ...newUserData]
        }
        return totalUsers
    }

    createMultipleBreakoutRooms = async (livestreamId = "", numberOfRooms = 0, assignType) => {
        const livestreamRef = this.firestore.collection("livestreams").doc(livestreamId)
        return this.firestore.runTransaction((transaction) => {
            return transaction.get(livestreamRef).then((livestreamSnap) => {
                const livestreamData = livestreamSnap.data()
                const isTestStream = livestreamData.test
                const companyLogo = livestreamData.companyLogoUrl || ""
                for (let i = 1; i <= numberOfRooms; i++) {
                    const breakoutRoomRef = livestreamRef.collection("breakoutRooms").doc()
                    const newBreakoutRoom = this.buildBreakoutRoom(breakoutRoomRef.id, isTestStream, `Breakout Room ${i}`, companyLogo, i)
                    transaction.set(breakoutRoomRef, newBreakoutRoom)
                    if (!isTestStream) {
                        // If the main stream isn't a test, we will then need secure tokens for each breakout room
                        const breakoutTokenRef = breakoutRoomRef.collection("tokens")
                            .doc("secureToken");
                        const token = uuidv4();
                        transaction.set(breakoutTokenRef, {
                            value: token,
                        })
                    }
                }
            });
        });
    }

    /**
     * @param {string} announcement
     * @param {string} mainStreamId
     * @param {({name:string, email:string})} author
     */
    sendBroadcastToBreakoutRooms = async (announcement, mainStreamId, author) => {
        const batch = this.firestore.batch()
        const breakoutRoomsRef = this.firestore.collection("livestreams")
            .doc(mainStreamId)
            .collection("breakoutRooms")

        const breakoutRoomsSnaps = await breakoutRoomsRef.get()

        for (const breakoutSnap of breakoutRoomsSnaps.docs) {
            let breakoutChatRef = breakoutSnap.ref
                .collection("chatEntries")
                .doc()
            const broadcastMessage = {
                authorEmail: author.email,
                authorName: author.name,
                message: announcement,
                timestamp: this.getServerTimestamp(),
                type: "broadcast"
            }
            batch.set(breakoutChatRef, broadcastMessage)

        }

        return await batch.commit()
    }

    // Streamer Helpers

    /**
     * Get the streamer's data from the current stream using their Id
     * @param {({liveSpeakers: array})|| Boolean} currentLivestream
     * @param {string} streamerId
     * @returns {({firstName: string, lastName: string})} streamerData
     */
    getStreamerData = (currentLivestream, streamerId) => {
       return  currentLivestream?.liveSpeakers?.find(speaker => speaker.speakerUuid === streamerId) || {
            firstName: "Streamer",
            lastName: "Streamer"
        }
    }

    // DB functions
    getStorageRef = () => {
        return this.storage.ref();
    }

    getBaseUrl = () => {
        let baseUrl = "https://careerfairy.io";
        if (window?.location?.origin) {
            baseUrl = window.location.origin;
        }
        return baseUrl
    }

    getServerTimestamp = () => {
        return firebase.firestore.FieldValue.serverTimestamp()
    }

}

export default Firebase;
