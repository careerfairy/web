import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage'

const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
};

class Firebase {

    constructor() {
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
        this.auth = firebase.auth();
        this.firestore = firebase.firestore();
        this.storage = firebase.storage();
    }

    // *** Auth API ***

    isSignInWithEmailLink = (link) => {
        return this.auth.isSignInWithEmailLink(link);
    };

    signInWithEmailLink = (email, link) => {
        return this.auth.signInWithEmailLink(email, link);
    };

    createUserWithEmailAndPassword = (email, password) => {
        return this.auth.createUserWithEmailAndPassword(email, password);
    };

    signInWithEmailAndPassword = (email, password) => {
        return this.auth.signInWithEmailAndPassword(email, password);
    };

    sendSignInLinkToEmail = (email) => {
        let actionCodeSettings = {
            url: 'http://localhost:3000/discover',
            handleCodeInApp: true,
        };
        return this.auth.sendSignInLinkToEmail(email, actionCodeSettings);
    };

    sendSignInLinkToEmailAndRedirect = (email, urlToRedirect) => {
        let actionCodeSettings = {
            url: urlToRedirect,
            handleCodeInApp: true,
        };
        return this.auth.sendSignInLinkToEmail(email, actionCodeSettings);
    };

    signInWithGoogle = () => {
        let provider = new firebase.auth.GoogleAuthProvider();
        return this.auth.signInWithPopup(provider);
    };

    signInWithFacebook = () => {
        let provider = new firebase.auth.FacebookAuthProvider();
        return this.auth.signInWithPopup(provider);
    };

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password => this.auth.currentUser.updatePassword(password);

    // *** Firestore API ***

    // USER

    getUserData = (userEmail) => {
        let userDataRef = this.firestore
            .collection("userData")
            .doc(userEmail);
        return userDataRef.get();
    };

    setUserData = (userEmail, firstName, lastName, university, faculty) => {
        let userDataRef = this.firestore
            .collection("userData")
            .doc(userEmail);
        return userDataRef.set({
            userEmail: userEmail,
            firstName: firstName,
            lastName: lastName,
            university: university,
            faculty: faculty
        });
    };

    setUniversityUserData = (userEmail, university, faculty) => {
        let userDataRef = this.firestore
            .collection("userData")
            .doc(userEmail);
        return userDataRef.set({
            userEmail: userEmail,
            university: university,
            faculty: faculty
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

    getCompanyLivestreams = (companyName) => {
        let userDataRef = this.firestore
            .collection("companyData")
            .doc(companyName)
            .collection("scheduledLivestreams");
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

    getLatestWishes = () => {
        let wishListRef = this.firestore
            .collection("wishList")
            .orderBy("date", "desc")
            .where("fulfilled", "==", false)
            .limit(4);

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

    deleteWish = (user, university, faculty, wishDoc) => {
        let wishRef = this.firestore
            .collection("wishList")
            .doc(wishDoc.id);
        return wishRef.delete();
    };

    // LIVESTREAM POLLS

    getLivestreamPolls = () => {
        let pollsRef = this.firestore
            .collection("livestreamPollData")
            .where("active", "==", true);
            
        return pollsRef.get();
    }

    getCurrentLivestreamPoll = () => {
        let pollsRef = this.firestore
            .collection("livestreamPollData")
            .where("current", "==", true)
            .limit(1);
            
        return pollsRef.get();
    }

    getLivestreamPollTopics = (pollId) => {
        let topicsRef = this.firestore
            .collection("livestreamPollData")
            .doc(pollId)
            .collection("topics");
        return topicsRef.get();
    }

    getLivestreamPollById = (pollId) => {
        let streamRef = this.firestore
            .collection("livestreamPollData")
            .doc(pollId);
        return streamRef.get();
    }

    registerEmailToNotify = (pollId, email) => {
        let topicsRef = this.firestore
            .collection("livestreamPollData")
            .doc(pollId)
            .collection("emailsToNotify");
        return topicsRef.add({
            email: email
        });
    }

    upvoteTopic = (pollId, topicId) => {
        let pollRef = this.firestore
            .collection("livestreamPollData")
            .doc(pollId);
        let topicRef = pollRef
            .collection("topics")
            .doc(topicId);
            return this.firestore.runTransaction( transaction => {
                return transaction.get(topicRef).then(topic => {
                    var newVotes = topic.data().votes + 1;
                    transaction.update(topicRef, { 
                        votes: newVotes
                    });
                })
            });
    }

    //SCHEDULED_LIVESTREAMS

    getLiveLivestreams = () => {
        let livestreamsRef = this.firestore
            .collection("scheduledLivestreams")
            .where("type", "==", "live");
        return livestreamsRef.get();
    }

    getScheduledLivestreams = (callback) => {
        let livestreamsRef = this.firestore
            .collection("scheduledLivestreams")
            .where("type", "==", "scheduled")
            .orderBy("start", "asc");
        return livestreamsRef.onSnapshot(callback);
    }

    getScheduledLivestreamsPreview = () => {
        let livestreamsRef = this.firestore
            .collection("scheduledLivestreams")
            .where("type", "==", "scheduled")
            .orderBy("start", "asc")
            .limit(3);
        return livestreamsRef.get();
    }

    getScheduledLivestreamById = (livestreamId, callback) => {
        let streamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return streamRef.onSnapshot(callback);
    }

    listenToScheduledLivestreamById = (livestreamId, callback) => {
        let streamRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId);
        return streamRef.onSnapshot(callback);
    }

    listenToLegacyScheduledLivestreamById = (livestreamId, callback) => {
        let streamRef = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId);
        return streamRef.onSnapshot(callback);
    }

    listenToScheduledLivestreamsQuestions = (livestreamId, callback) => {
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions");
        return questionsRef.onSnapshot(callback);
    }

    listenToScheduledLivestreamQuestionComments = (livestreamId, questionId, callback) => {
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(questionId)
            .collection("comments")
            .orderBy("timestamp", "asc");
        return questionsRef.onSnapshot(callback);
    }

    setScheduledLivestreamHasStarted = (hasStarted, livestreamId) => {
        let streamRef = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId);
        return streamRef.update({
            hasStarted: hasStarted
        });
    }

    putScheduledLivestreamsQuestion = (livestreamId, question) => {
        question.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions");
        return questionsRef.add(question);
    }

    putScheduledLivestreamQuestionComment = (livestreamId, questionId, comment) => {
        comment.timestamp = firebase.firestore.Timestamp.fromDate(new Date());
        let commentsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(questionId)
            .collection("comments");
        return commentsRef.add(comment);
    }

    listenToScheduledLivestreamsComments = (livestreamId, callback) => {
        let commentRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("comments")
            .orderBy("date", "asc");
        return commentRef.onSnapshot(callback);
    }

    upvoteQuestion = (livestreamId, question, userEmail) => {
        let questionRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction( transaction => {
            return transaction.get(questionRef).then(question => {
                const newVoteNumber = question.data().votes + 1;
                transaction.update(questionRef, { 
                    votes: newVoteNumber,
                    emailOfVoters: firebase.firestore.FieldValue.arrayUnion(userEmail)
                });
            });
        });
    }

    downvoteQuestion = (livestreamId, question, userEmail) => {
        let questionRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction( transaction => {
            return transaction.get(questionRef).then(question => {
                transaction.update(questionRef, { 
                    emailOfVoters: firebase.firestore.FieldValue.arrayUnion(userEmail)
                });
            });
        });
    }


    getScheduledLivestreamsUntreatedQuestions = (livestreamId, callback) => {
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "new")
            .orderBy("votes", "desc");
        return questionsRef.onSnapshot(callback);
    }

    getPastLivestreamsUntreatedQuestions = (livestreamId, callback) => {
        let questionsRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "done")
            .orderBy("timecode", "asc");
        return questionsRef.onSnapshot(callback);
    }

    getLegacyPastLivestreamsUntreatedQuestions = (livestreamId, callback) => {
        let questionsRef = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId)
            .collection("questions")
            .where("type", "==", "done")
            .orderBy("timecode", "asc");
        return questionsRef.onSnapshot(callback);
    }

    markQuestionAsDone = (livestreamId, question) => {
        let questionRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("questions")
            .doc(question.id);
        return this.firestore.runTransaction( transaction => {
            return transaction.get(questionRef).then(question => {
                transaction.update(questionRef, { 
                    type: "done"
                });
            });
        });
    }

    removeQuestion = (livestreamId, question) => {
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

    getPastLivestreamById = (livestreamId) => {
        let streamRef = this.firestore
            .collection("scheduledLivestreams")
            .doc(livestreamId);
        return streamRef.get();
    }

    getPastLivestreams = () => {
        let livestreamsRef = this.firestore
            .collection("livestreams")
            .where("type", "==", "past")
            .orderBy("rank", "asc");
        return livestreamsRef.get();
    }

    listenToUpcomingLivestreams = (callback) => {
        let livestreamsRef = this.firestore
            .collection("livestreams")
            .where("type", "==", "upcoming")
            .orderBy("start", "asc");
        return livestreamsRef.onSnapshot(callback);
    }

    registerToLivestream = (livestreamId, userId) => {
        debugger;
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

    // VIDEOS

    getAllVideos = () => {
        let videosRef = this.firestore
            .collection("videos")
        return videosRef.get();
    }

    getRecentVideos = () => {
        let videosRef = this.firestore
            .collection("videos")
            .orderBy("timestamp", "desc");
        return videosRef.get();
    }

    getVideoById = (videoId) => {
        let videosRef = this.firestore
            .collection("videos")
            .doc(videoId);
        return videosRef.get();
    }

    getStorageRef = () => {
        return this.storage.ref();
    }
}

export default Firebase;