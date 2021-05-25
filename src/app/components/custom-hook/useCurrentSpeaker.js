import React, {useCallback, useEffect, useState} from 'react';
import {useRouter} from "next/router";
import {useCurrentStream} from "../../context/stream/StreamContext";
import {useFirebase} from "context/firebase";
import useStreamRef from "./useStreamRef";


/**
 * @param {(null | Object)} localMediaStream - The employee who is responsible for the project.
 * @param {string} localMediaStream.streamId - The name of the employee.
 * @param {Object[]} externalMediaStreams - An Array of external stream Objects
 * @returns {{}} Returns the 3 stream link types
 */
const useCurrentSpeaker = (localMediaStream, externalMediaStreams) => {
    const streamRef = useStreamRef();
    const {
        isMainStreamer,
        currentLivestream: {
            currentSpeakerId: firestoreCurrentSpeaker,
            mode,
            screenSharerId,
            speakerSwitchMode,
            id: streamId
        }
    } = useCurrentStream()
    const [audioCounter, setAudioCounter] = useState(0);

    const {setLivestreamCurrentSpeakerId} = useFirebase()
    const [currentSpeakerId, setCurrentSpeakerId] = useState(firestoreCurrentSpeaker);

    useEffect(() => {
        if (mode !== 'desktop' && speakerSwitchMode !== 'manual') {
            if (isMainStreamer) {
                const unsubscribe = manageCurrentSpeaker()
                return () => unsubscribe()
            } else {
                const allStreams = getAllStreams(localMediaStream, externalMediaStreams)
                const streamsHaveMainStreamer = checkIfHasMainStreamer(allStreams)
                if (!streamsHaveMainStreamer) {
                    const unsubscribe = manageCurrentSpeaker({isFallback: true})
                    return () => unsubscribe()
                }
            }
        }
    }, [audioCounter, mode, externalMediaStreams.length, localMediaStream]);

    const manageCurrentSpeaker = (options = {isFallback: false}) => {
        const isFallback = Boolean(options.isFallback)
        let timeout = setTimeout(() => {
            let audioLevels = externalMediaStreams.map(stream => {
                if (stream.streamId !== 'demoStream') {
                    return {
                        streamId: stream.streamId,
                        audioLevel: stream.stream.getAudioLevel()
                    }
                } else {
                    return {
                        streamId: stream.streamId,
                        audioLevel: 0
                    }
                }
            });
            if (localMediaStream) {
                audioLevels.push({
                    streamId: localMediaStream.getId(),
                    audioLevel: localMediaStream.getAudioLevel()
                });
            }
            if (audioLevels && audioLevels.length > 1) {
                const maxEntry = audioLevels.reduce((prev, current) => (prev.audioLevel > current.audioLevel) ? prev : current);
                if (maxEntry.audioLevel > 0.05) {
                    handleChangeCurrentSpeakerId(maxEntry.streamId, isFallback);
                } else if (!audioLevels.some(audioLevel => audioLevel.streamId === firestoreCurrentSpeaker)) {
                    handleChangeCurrentSpeakerId(maxEntry.streamId, isFallback);
                }
            }
            setAudioCounter(audioCounter + 1);
        }, 2500);

        return () => {
            clearTimeout(timeout)
        };
    }

    useEffect(() => {
        if (isMainStreamer && mode === 'desktop') {
            handleChangeCurrentSpeakerId(screenSharerId);
        }
    }, [mode])

    useEffect(() => {
        if (externalMediaStreams && firestoreCurrentSpeaker) {// TODO get rid of this
            let existingCurrentSpeaker = externalMediaStreams.find(stream => stream.streamId === firestoreCurrentSpeaker)
            if (!existingCurrentSpeaker) {
                handleChangeCurrentSpeakerId(streamId);
            }
        }
    }, [externalMediaStreams])

    useEffect(() => {
        if (firestoreCurrentSpeaker) {
            setCurrentSpeakerId(firestoreCurrentSpeaker)
        }
    }, [firestoreCurrentSpeaker])

    const handleChangeCurrentSpeakerId = useCallback((id, isFallback) => {
        if (isFallback) return setCurrentSpeakerId(id)
        setLivestreamCurrentSpeakerId(streamRef, id);
    }, [streamRef])

    const getAllStreams = (localMediaStream, externalMediaStreams) => {
        let allStreams = []
        if (externalMediaStreams) {
            allStreams = [...externalMediaStreams]
        }
        if (localMediaStream) {
            allStreams.push(localMediaStream)
        }
        return allStreams
    }

    const checkIfHasMainStreamer = useCallback((streams) => {
        return streams.some(stream => stream.streamId === streamId)
    }, [streamId])


    return currentSpeakerId;
}

export default useCurrentSpeaker;