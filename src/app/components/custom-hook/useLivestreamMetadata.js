import { withFirebase } from 'context/firebase';
import { useState, useEffect } from 'react';

export function useLivestreamMetadata(livestream, firebase, userRequestedDownload) {

    const [questions, setQuestions] = useState(undefined);
    const [polls, setPolls] = useState(undefined);
    const [icons, setIcons] = useState(undefined);
    const [livestreamSpeakers, setLivestreamSpeakers] = useState(undefined);
    const [hasDownloaded, setHasDownloaded] = useState(false);

    useEffect(() => {
        if (questions !== undefined && polls !== undefined && icons !== undefined && livestreamSpeakers !== undefined) {
            setHasDownloaded(true);
        }  
    }, [questions, polls, icons, livestreamSpeakers]);

    useEffect(() => {
        if (livestream && userRequestedDownload) {
            firebase.listLivestreamQuestions(livestream.id, querySnapshot => {
                let questionList = [];
                querySnapshot.forEach(doc => {
                    let cc = doc.data();
                    cc.id = doc.id;
                    questionList.push(cc);
                });
                setQuestions(questionList);
            })
        }  
    }, [livestream, userRequestedDownload]);

    useEffect(() => {
        if (livestream && userRequestedDownload) {
            firebase.listenToPollEntries(livestream.id, querySnapshot => {
                let pollList = [];
                querySnapshot.forEach(doc => {
                    let cc = doc.data();
                    cc.id = doc.id;
                    pollList.push(cc);
                });
                setPolls(pollList);
            })
        }  
    }, [livestream, userRequestedDownload]);

    useEffect(() => {
        if (livestream && userRequestedDownload) {
            firebase.getLivestreamSpeakers(livestream.id).then((querySnapshot) => {
                    var speakerList = [];
                    querySnapshot.forEach((doc) => {
                        let speaker = doc.data();
                        speaker.id = doc.id;
                        speakerList.push(speaker);
                    });
                    setLivestreamSpeakers(speakerList);
                });
        }
    }, [livestream, userRequestedDownload]);

    useEffect(() => {
        if (livestream && userRequestedDownload) {
            firebase.listenToLivestreamIcons(livestream.id, querySnapshot => {
                let iconList = [];
                querySnapshot.forEach(doc => {
                    let cc = doc.data();
                    cc.id = doc.id;
                    iconList.push(cc);
                });
                setIcons(iconList);
            })
        }  
    }, [livestream, userRequestedDownload]);
  
    return { hasDownloaded, questions, polls, icons, livestreamSpeakers };
}
