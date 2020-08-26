import axios from 'axios';
import Firebase from '../../context/firebase/index';

const PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;

const FIREBASE_REST_PATH = "https://firestore.googleapis.com/v1/projects/careerfairy-e1fd9/databases/(default)/documents";

class FirebaseRest {

    static getUpcomingLivestreams = () => {
        return axios({
                method: 'post',
                url: FIREBASE_REST_PATH + ':runQuery',
                data: { 
                    structuredQuery: {   
                        from: [{ collectionId: 'livestreams' }], 
                        where: { 
                            fieldFilter: { 
                                field: { 
                                    fieldPath: 'start' 
                                }, 
                                    op: 'GREATER_THAN', 
                                    value: { 
                                        timestampValue: new Date(Date.now()) 
                                    } 
                                } 
                            }     
                        }
                    }
                })
    }

    static getScheduledLivestreamById = (livestreamId) => {
        return axios({
                method: 'get',
                url: FIREBASE_REST_PATH + '/livestreams/' + livestreamId,
            })
    }

    static getScheduledLivestreamQuestions = (livestreamId) => {
        return axios({
            method: 'post',
            url: FIREBASE_REST_PATH + '/livestreams/' + livestreamId + ':runQuery',
            data: { 
                structuredQuery: {   
                    from: [{ collectionId: 'questions' }], 
                    orderBy: [{ 
                            field: { 
                                fieldPath: 'type' 
                            }, 
                                direction: 'ASCENDING'
                        },{ 
                            field: { 
                                fieldPath: 'votes' 
                            }, 
                                direction: 'DESCENDING'
                        },{ 
                            field: { 
                                fieldPath: 'timestamp' 
                            }, 
                                direction: 'ASCENDING'
                        }]     
                    }
                }
            })
    }

    static getScheduledLivestreamComments = (livestreamId, questionId) => {
        return axios({
            method: 'post',
            url: FIREBASE_REST_PATH + '/livestreams/' + livestreamId + '/questions/' + questionId + ':runQuery',
            data: { 
                structuredQuery: {   
                    from: [{ collectionId: 'comments' }], 
                    orderBy: [{ 
                            field: { 
                                fieldPath: 'timestamp' 
                            }, 
                                direction: 'ASCENDING'
                        }]     
                    }
                }
            })
    }

    static putQuestionComment = (livestreamId, questionId, comment) => {
        return axios({
            method: 'post',
            url: FIREBASE_REST_PATH + '/livestreams/' + livestreamId + '/questions/' + questionId + '/comments',
            data: { 
                fields: { 
                    title: { stringValue: comment.title }, 
                    author: { stringValue: comment.author }, 
                    timestamp: { timestampValue: new Date(Date.now()).toISOString() }, 
                } 
            }
        })
    }

    static goToNextLivestreamQuestion = (previousCurrentQuestionId, newCurrentQuestionId, livestreamId) => {
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

}

export default FirebaseRest;