import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

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
        let userDataRef = this.firestore
            .collection("userData")
            .doc(userEmail);
        return userDataRef.get();
    };

    listenToUserData = (userEmail, callback) => {
        let userDataRef = this.firestore
            .collection("userData")
            .doc(userEmail);
        return userDataRef.onSnapshot(callback);
    };

    setUserData = (userEmail, firstName, lastName, university, faculty, levelOfStudy) => {
        let userDataRef = this.firestore
            .collection("userData")
            .doc(userEmail);
        return userDataRef.set({
            userEmail: userEmail,
            firstName: firstName,
            lastName: lastName,
            university: university,
            faculty: faculty,
            levelOfStudy: levelOfStudy
        });
    };

    // COMPANIES

    getCompanies = () => {
        let userDataRef = this.firestore
            .collection("companyData")
            .orderBy("rank", "asc");
        return userDataRef.get();
    };

    getCompanyById = (companyId) => {
        let userDataRef = this.firestore
            .collection("companyData")
            .doc(companyId);
        return userDataRef.get();
    };

    getCompaniesWithProfile = () => {
        let userDataRef = this.firestore
            .collection("companyData")
            .where("profile", "==", true);
        return userDataRef.get();
    };

    getCompanyPositions = (companyName) => {
        let userDataRef = this.firestore
            .collection("companyData")
            .doc(companyName.replace(/\s/g, ""))
            .collection("currentPositions");
        return userDataRef.get();
    };

    getCompanyVideos = (companyId) => {
        let userDataRef = this.firestore
            .collection("videos")
            .where("companyId", "==", companyId)
            .orderBy("priority", "asc");
        return userDataRef.get();
    };

    getCareerCenterByUniversityId = (universityId) => {
        let userDataRef = this.firestore
            .collection("careerCenterData")
            .where("universityId", "==", universityId);
        return userDataRef.get();
    };

    // MENTORS

    getMentors = () => {
        let userDataRef = this.firestore
            .collection("mentors")
        return userDataRef.get();
    };

    // WISHLIST

    getWishList = () => {
        let wishListRef = this.firestore
            .collection("wishList")
            .orderBy("vote", "desc")
            .where("fulfilled", "==", false);

        return wishListRef.get();
    };

    getLatestFulfilledWishes = () => {
        let wishListRef = this.firestore
            .collection("wishList")
            .where("fulfilled", "==", true)
            .orderBy("vote", "desc");

        return wishListRef.get();
    };

    addNewWish = (user, wish) => {
        let wishListRef = this.firestore
            .collection("wishList");
        return wishListRef.add({
            wish: wish,
            fulfilled: false,
            vote: 1,
            date: firebase.firestore.Timestamp.fromDate(new Date())
        });
    };

    addVoteToWish = (wish, user) => {
        let wishRef = this.firestore
            .collection("wishList")
            .doc(wish.id);
        return wishRef.update({
            vote: wish.vote + 1
        })
    };

    //SCHEDULED_LIVESTREAMS

    getScheduledLivestreamById = (livestreamId) => {
        let streamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return streamRef.get();
    }

    setMainStreamIdToLivestreamStreamers = (livestreamId, streamId) => {
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return livestreamRef.update({
            streamIds: [streamId]
        });
    }

    addStreamIdToLivestreamStreamers = (livestreamId, streamId) => {
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return livestreamRef.update({
            streamIds: firebase.firestore.FieldValue.arrayUnion(streamId)
        });
    }

    removeStreamIdFromLivestreamStreamers = (livestreamId, streamId) => {
        let livestreamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return livestreamRef.update({
            streamIds: firebase.firestore.FieldValue.arrayRemove(streamId)
        });
    }

    listenToScheduledLivestreamById = (livestreamId, callback) => {
        let streamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return streamRef.onSnapshot(callback);
    }

    getLivestreamSpeakers = (livestreamId) => {
        let streamerRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("speakers")
        return streamerRef.get();
    }

    createNewLivestreamSpeaker = (livestreamId, speakerName, mainSpeaker) => {
        if (mainSpeaker) {
            let streamerRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .doc(livestreamId);
            return streamerRef.set({
                counter: 0,
                name: speakerName,
                connected: false,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date())
            }); 
        } else {
            let streamerRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers");
            return streamerRef.add({
                counter: 0,
                name: speakerName,
                connected: false,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date())
            });
        }     
    }

    deleteLivestreamSpeaker = (livestreamId, speakerId) => {
        let streamerRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .doc(speakerId);
        return streamerRef.delete();
    }

    listenToLivestreamLiveSpeakers = (livestreamId, callback) => {
        let streamerRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .orderBy("timestamp", "asc");;
        return streamerRef.onSnapshot(callback);
    }

    setLivestreamLiveSpeakersConnected = (livestreamId, registeredSpeaker) => {
        let streamerRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .doc(registeredSpeaker.id);
        return streamerRef.update({
            connected: true,
            connectionValue: registeredSpeaker.connectionValue ? (registeredSpeaker.connectionValue + 1) : 1
        });
    }

    setLivestreamLiveSpeakersDisconnected = (livestreamId, speakerId) => {
        let streamerRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("liveSpeakers")
            .doc(speakerId);
        return streamerRef.update({
            connected: false,
        });
    }

    getLegacyScheduledLivestreamById = (livestreamId) => {
        let streamRef = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId);
        return streamRef.get();
    }

    listenToLivestreamQuestions = (livestreamId, callback) => {
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .orderBy("type", "asc")
            .orderBy("votes", "desc")
            .orderBy("timestamp", "asc");
        return questionsRef.onSnapshot(callback);
    }

    listenToQuestionComments = (livestreamId, questionId, callback) => {
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(questionId)
            .collection("comments")
            .orderBy("timestamp", "asc");
        return questionsRef.onSnapshot(callback);
    }

    putQuestionComment = (livestreamId, questionId, comment) => {
        comment.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let commentsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(questionId)
            .collection("comments");
        return commentsRef.add(comment);
    }

    putLivestreamQuestion = (livestreamId, question) => {
        question.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions");
        return questionsRef.add(question);
    }

    upvoteLivestreamQuestion = (livestreamId, question, userEmail) => {
        let questionRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction( transaction => {
            return transaction.get(questionRef).then(question => {
                transaction.update(questionRef, { 
                    votes: question.data().votes + 1,
                    emailOfVoters: firebase.firestore.FieldValue.arrayUnion(userEmail)
                });
            });
        });
    }

    listenToLivestreamCurrentQuestion = (livestreamId, callback) => {
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "current");
        return questionsRef.onSnapshot(callback);
    }

    putLivestreamComment = (livestreamId, comment) => {
        comment.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let commentsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("comments");
        return commentsRef.add(comment);
    }

    setLivestreamHasStarted = (hasStarted, livestreamId) => {
        let streamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return streamRef.update({
            hasStarted: hasStarted
        });
    }

    getLegacyPastLivestreamQuestions = (livestreamId) => {
        let questionsRef = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "done")
            .orderBy("timecode", "asc");
        return questionsRef.get();
    }

    goToNextLivestreamQuestion = (previousCurrentQuestionId, newCurrentQuestionId, livestreamId) => {
        var batch = this.firestore.batch();
        if (previousCurrentQuestionId) {
            let previousCurrentQuestionRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(previousCurrentQuestionId);
            batch.update(previousCurrentQuestionRef,  { type: "done" });
        }
        let newCurrentQuestionRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(newCurrentQuestionId)
        batch.update(newCurrentQuestionRef,  { type: "current" });        
        batch.commit();
    }

    removeLivestreamQuestion = (livestreamId, question) => {
        let questionRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction( transaction => {
            return transaction.get(questionRef).then(question => {
                transaction.update(questionRef, { 
                    type: "removed"
                });
            });
        });
    }

    getPastLivestreams = () => {
        let livestreamsRef = this.firestore
            .collection("livestreams")
            .where("type", "==", "past")
            .orderBy("rank", "asc");
        return livestreamsRef.get();
    }


    listenToUpcomingLivestreams = (callback) => {
        var thirtyMinutesInMilliseconds = 1000 * 60 * 30;
        let livestreamsRef = this.firestore
            .collection("livestreams")
            .where("start", ">", new Date(Date.now() - thirtyMinutesInMilliseconds))
            .orderBy("start", "asc");
        return livestreamsRef.onSnapshot(callback);
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
        return this.firestore.runTransaction( transaction => {
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
        let userRef = this.firestore
            .collection("userData")
            .doc(userId)
        return this.firestore.runTransaction( transaction => {
            return transaction.get(userRef).then(user => {
                transaction.update(userRef, { 
                    talentPools: firebase.firestore.FieldValue.arrayUnion(companyId)
                });
            });
        });
    }

    leaveCompanyTalentPool = (companyId, userId) => {
        let userRef = this.firestore
            .collection("userData")
            .doc(userId)
        return this.firestore.runTransaction( transaction => {
            return transaction.get(userRef).then(company => {
                transaction.update(userRef, { 
                    talentPools: firebase.firestore.FieldValue.arrayRemove(companyId)
                });
            });
        });
    }

    getRegisteredStudentsInLivestream = (livestreamId) => {
        let studentsRef = this.firestore
                    .collection("livestreams")
                    .doc(livestreamId)
                    .collection("registeredStudents")
        return studentsRef.get();
    }

    getStudentsInCompanyTalentPool = (companyId) => {
        let studentsRef = this.firestore
                    .collection("userData")
                    .where("talentPools", "array-contains", companyId);
        return studentsRef.get();
    }
}

export default Firebase;