import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

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
    }

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

    // *** Firestore API ***

    // USER

    getUserData = (userEmail) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userEmail);
        return ref.get();
    };

    listenToUserData = (userEmail, callback) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userEmail);
        return ref.onSnapshot(callback);
    };

    setUserData = (userEmail, firstName, lastName) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userEmail);
        return ref.update({
            userEmail: userEmail,
            firstName: firstName,
            lastName: lastName
        });
    };

    joinGroup = (userId, arrayOfIds, arrayOfGroupObjects) => {
        let userRef = this.firestore
            .collection("userData")
            .doc(userId)
        return userRef.update({
            groupIds: arrayOfIds,
            registeredGroups: arrayOfGroupObjects
        })
    }

    listenToGroups = (callback) => {
        let groupRefs = this.firestore
            .collection("careerCenterData")
        return groupRefs.onSnapshot(callback)
    }

    listenToUserGroupCategoryValue = (userEmail, groupId, categoryId, callback) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userEmail)
            .collection("registeredGroups")
            .doc(groupId)
            .collection("categories")
            .doc(categoryId);
        return ref.onSnapshot(callback);
    }

    updateUserGroupCategoryValue = (userEmail, groupId, categoryId, value) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userEmail)
            .collection("registeredGroups")
            .doc(groupId)
            .collection("categories")
            .doc(categoryId);
        return ref.update({value: value});
    }

    // COMPANIES

    getCompanies = () => {
        let ref = this.firestore
            .collection("companyData")
            .orderBy("rank", "asc");
        return ref.get();
    };

    getCompanyById = (companyId) => {
        let ref = this.firestore
            .collection("companyData")
            .doc(companyId);
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

    createCareerCenter(careerCenter) {
        let ref = this.firestore
            .collection("careerCenterData");
        return ref.add(careerCenter);
    }

    updateCareerCenter = (groupId, newCareerCenter) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
        return ref.update(newCareerCenter)
    }

    deleteCareerCenterFromAllUsers = (careerCenterId) => {
        let batch = this.firestore.batch();
        // get all relevant users
        return this.firestore
            .collection('userData')
            .where("groupIds", "array-contains", `${careerCenterId}`)
            .get().then(querySnapshot => {
                querySnapshot.docs.forEach((userDoc, index) => {
                    // get the user document
                    let userRef = this.firestore
                        .collection('userData')
                        .doc(userDoc.id)
                    // remove the careerCenterId from the groupIds Array in the userData field
                    batch.update(userRef, {
                        groupIds: firebase.firestore.FieldValue.arrayRemove(careerCenterId)
                    })
                    // remove the careerCenterId from the registeredGroups collection
                    let registeredGroupsRef = userRef.collection('registeredGroups')
                    batch.delete(registeredGroupsRef.doc(careerCenterId));
                    if (index === querySnapshot.size - 1) {// Once done looping, return the batch commit
                        return batch.commit()
                    }
                })
            })
    }

    deleteCareerCenter = (careerCenterId) => {
        let careerCenterRef = this.firestore
            .collection("careerCenterData")
            .doc(careerCenterId)
        return careerCenterRef.delete()
    }

    getCareerCenters = () => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false);
        return ref.get();
    }

    getCareerCenterById = (careerCenterId) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .doc(careerCenterId);
        return ref.get();
    }

    getCareerCenterByUniversityId = (universityId) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false)
            .where("universityId", "==", universityId);
        return ref.get();
    };

    getCareerCentersByAdminEmail = (adminEmail) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("adminEmail", "==", adminEmail);
        return ref.get();
    }

    getCareerCentersByGroupId = (arrayOfIds) => {
        const refs = arrayOfIds.map(id => this.firestore.collection('careerCenterData').doc(id))
        return this.firestore.getAll(...refs)
    }

    listenToCareerCenterById = (groupId, callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
        return ref.onSnapshot(callback);
    }

    listenCareerCentersByAdminEmail = (email, callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("adminEmail", "==", email)
        return ref.onSnapshot(callback);
    }

    listenToJoinedGroups = (groupIds, callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("groupId", 'in', groupIds)
        return ref.onSnapshot(callback);
    }

    getGroupCategoryElements = (groupId, categoryId) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("categories")
            .doc(categoryId)
            .collection("elements");
        return ref.get();
    }

    listenToGroupCategoryElements = (groupId, categoryId, callback) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("categories")
            .doc(categoryId)
            .collection("elements");
        return ref.onSnapshot(callback);
    }

    updateGroupCategoryElements = (groupId, newCategories) => {
        let groupRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
        return groupRef.update({categories: newCategories})
    }

    addGroupCategoryWithElements = (groupId, newCategoryObj) => {
        let groupRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)

        return groupRef.update({
            categories: firebase.firestore.FieldValue.arrayUnion(newCategoryObj)
        });
    }

    addMultipleGroupCategoryWithElements = (groupId, arrayOfCategories) => {
        let batch = this.firestore.batch()

        arrayOfCategories.forEach(category => {
            let categoryRef = this.firestore
                .collection("careerCenterData")
                .doc(groupId)
                .collection("categories")
            var newCategoryRef = categoryRef.doc()
            batch.set(newCategoryRef, {name: category.name})

            let elementsRef = this.firestore
                .collection("careerCenterData")
                .doc(groupId)
                .collection("categories")
                .doc(newCategoryRef.id)
                .collection("elements");
            category.options.forEach(option => {
                var newElementRef = elementsRef.doc();
                batch.set(newElementRef, {name: option.name});
            })
        })
        return batch.commit()
    }

    // MENTORS

    getMentors = () => {
        let ref = this.firestore
            .collection("mentors")
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
        let ref = this.firestore
            .collection("wishList");
        return ref.add({
            wish: wish,
            fulfilled: false,
            vote: 1,
            date: firebase.firestore.Timestamp.fromDate(new Date())
        });
    };

    addVoteToWish = (wish, user) => {
        let ref = this.firestore
            .collection("wishList")
            .doc(wish.id);
        return ref.update({
            vote: wish.vote + 1
        })
    };

    //SCHEDULED_LIVESTREAMS

    getScheduledLivestreamById = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return ref.get();
    }

    setMainStreamIdToLivestreamStreamers = (livestreamId, streamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return ref.update({
            streamIds: [streamId]
        });
    }

    addStreamIdToLivestreamStreamers = (livestreamId, streamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return ref.update({
            streamIds: firebase.firestore.FieldValue.arrayUnion(streamId)
        });
    }

    removeStreamIdFromLivestreamStreamers = (livestreamId, streamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return ref.update({
            streamIds: firebase.firestore.FieldValue.arrayRemove(streamId)
        });
    }

    setLivestreamMode = (livestreamId, mode) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
        return ref.update({
            mode: mode
        });
    }

    setLivestreamSpeakerSwitchMode = (livestreamId, mode) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
        return ref.update({
            speakerSwitchMode: mode
        });
    }

    setLivestreamCurrentSpeakerId = (livestreamId, id) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
        return ref.update({
            currentSpeakerId: id
        });
    }

    setLivestreamPresentation = (livestreamId, downloadUrl) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("presentations")
            .doc("presentation");
        return ref.set({
            downloadUrl: downloadUrl,
            page: 1
        });
    }

    increaseLivestreamPresentationPageNumber = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("presentations")
            .doc("presentation");
        return this.firestore.runTransaction(transaction => {
            return transaction.get(ref).then(presentation => {
                transaction.update(ref, {
                    page: presentation.data().page + 1,
                });
            });
        });
    }

    decreaseLivestreamPresentationPageNumber = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("presentations")
            .doc("presentation");
        return this.firestore.runTransaction(transaction => {
            return transaction.get(ref).then(presentation => {
                transaction.update(ref, {
                    page: presentation.data().page - 1,
                });
            });
        });
    }

    listenToLivestreamPresentation = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("presentations")
            .doc("presentation");
        return ref.onSnapshot(callback);
    }

    listenToScheduledLivestreamById = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return ref.onSnapshot(callback);
    }

    getLivestreamSpeakers = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("speakers")
        return ref.get();
    }

    createNewLivestreamSpeaker = (livestreamId, speakerName, mainSpeaker) => {
        if (mainSpeaker) {
            let ref = this.firestore
                .collection("livestreams")
                .doc(livestreamId)
                .collection("liveSpeakers")
                .doc(livestreamId);
            return ref.set({
                counter: 0,
                name: speakerName,
                connected: false,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date())
            });
        } else {
            let ref = this.firestore
                .collection("livestreams")
                .doc(livestreamId)
                .collection("liveSpeakers");
            return ref.add({
                counter: 0,
                name: speakerName,
                connected: false,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date())
            });
        }
    }

    deleteLivestreamSpeaker = (livestreamId, speakerId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .doc(speakerId);
        return ref.delete();
    }

    listenToLivestreamLiveSpeakers = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .orderBy("timestamp", "asc");
        return ref.onSnapshot(callback);
    }

    listenToConnectedLivestreamLiveSpeakers = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .where("connected", "==", true);
        return ref.onSnapshot(callback);
    }

    setLivestreamLiveSpeakersConnected = (livestreamId, registeredSpeaker) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .doc(registeredSpeaker.id);
        return ref.update({
            connected: true,
            connectionValue: registeredSpeaker.connectionValue ? (registeredSpeaker.connectionValue + 1) : 1
        });
    }

    setLivestreamLiveSpeakersDisconnected = (livestreamId, speakerId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .doc(speakerId);
        return ref.update({
            connected: false,
        });
    }

    getLegacyScheduledLivestreamById = (livestreamId) => {
        let ref = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId);
        return ref.get();
    }

    listenToLivestreamQuestions = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .orderBy("type", "asc")
            .orderBy("votes", "desc")
            .orderBy("timestamp", "asc");
        return ref.onSnapshot(callback);
    }

    listenToQuestionComments = (livestreamId, questionId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(questionId)
            .collection("comments")
            .orderBy("timestamp", "asc");
        return ref.onSnapshot(callback);
    }

    putQuestionComment = (livestreamId, questionId, comment) => {
        comment.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(questionId)
            .collection("comments");
        return ref.add(comment);
    }

    putLivestreamQuestion = (livestreamId, question) => {
        question.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions");
        return ref.add(question);
    }

    upvoteLivestreamQuestion = (livestreamId, question, userEmail) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction(transaction => {
            return transaction.get(ref).then(question => {
                transaction.update(ref, {
                    votes: question.data().votes + 1,
                    emailOfVoters: firebase.firestore.FieldValue.arrayUnion(userEmail)
                });
            });
        });
    }

    listenToLivestreamCurrentQuestion = (livestreamId, callback) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "current");
        return ref.onSnapshot(callback);
    }

    putLivestreamComment = (livestreamId, comment) => {
        comment.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("comments");
        return ref.add(comment);
    }

    setLivestreamHasStarted = (hasStarted, livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return ref.update({
            hasStarted: hasStarted
        });
    }

    getLivestreamCareerCenters = (universityIds) => {
        let ref = this.firestore
            .collection("careerCenterData")
            .where("test", "==", false)
            .where("universityId", "in", universityIds);
        return ref.get();
    }

    getLegacyPastLivestreamQuestions = (livestreamId) => {
        let ref = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "done")
            .orderBy("timecode", "asc");
        return ref.get();
    }

    goToNextLivestreamQuestion = (previousCurrentQuestionId, newCurrentQuestionId, livestreamId) => {
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
            .doc(newCurrentQuestionId)
        batch.update(ref, {type: "current"});
        batch.commit();
    }

    removeLivestreamQuestion = (livestreamId, question) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction(transaction => {
            return transaction.get(ref).then(question => {
                transaction.update(ref, {
                    type: "removed"
                });
            });
        });
    }

    getPastLivestreams = () => {
        let ref = this.firestore
            .collection("livestreams")
            .where("type", "==", "past")
            .orderBy("rank", "asc");
        return ref.get();
    }


    listenToUpcomingLivestreams = (callback) => {
        var thirtyMinutesInMilliseconds = 1000 * 60 * 30;
        let ref = this.firestore
            .collection("livestreams")
            .where("start", ">", new Date(Date.now() - thirtyMinutesInMilliseconds))
            .orderBy("start", "asc");
        return ref.onSnapshot(callback);
    }

    registerToLivestream = (livestreamId, userId) => {
        let userRef = this.firestore
            .collection("userData")
            .doc(userId);
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        let registeredUsersRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("registeredStudents")
            .doc(userId)
        return this.firestore.runTransaction(transaction => {
            return transaction.get(userRef).then(userDoc => {
                const user = userDoc.data();
                transaction.update(livestreamRef, {
                    registeredUsers: firebase.firestore.FieldValue.arrayUnion(userId)
                });
                transaction.set(registeredUsersRef, {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    university: user.university,
                    levelOfStudy: user.levelOfStudy,
                    faculty: user.faculty
                });
            });
        });
    }

    deregisterFromLivestream = (livestreamId, userId) => {
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        let registeredUsersRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("registeredStudents")
            .doc(userId)
        let batch = this.firestore.batch();
        batch.update(livestreamRef, {
            registeredUsers: firebase.firestore.FieldValue.arrayRemove(userId)
        });
        batch.delete(registeredUsersRef);
        return batch.commit();
    }

    joinCompanyTalentPool = (companyId, userId) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userId)
        return this.firestore.runTransaction(transaction => {
            return transaction.get(ref).then(user => {
                transaction.update(ref, {
                    talentPools: firebase.firestore.FieldValue.arrayUnion(companyId)
                });
            });
        });
    }

    leaveCompanyTalentPool = (companyId, userId) => {
        let ref = this.firestore
            .collection("userData")
            .doc(userId)
        return this.firestore.runTransaction(transaction => {
            return transaction.get(ref).then(company => {
                transaction.update(ref, {
                    talentPools: firebase.firestore.FieldValue.arrayRemove(companyId)
                });
            });
        });
    }

    getRegisteredStudentsInLivestream = (livestreamId) => {
        let ref = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("registeredStudents")
        return ref.get();
    }

    getStudentsInCompanyTalentPool = (companyId) => {
        let ref = this.firestore
            .collection("userData")
            .where("talentPools", "array-contains", companyId);
        return ref.get();
    }

    getStorageRef() {
        return this.storage.ref();
    }
}

export default Firebase;