import {v4 as uuidv4} from "uuid";


export const speakerObj = {
    avatar: '',
    firstName: '',
    lastName: '',
    position: '',
    background: ''
}

export const getStreamSubCollectionSpeakers = (livestream, speakerQuery) => {
    if (!speakerQuery.empty && !livestream.speakers) { // if this stream doc has no speakers array and but has a sub-collection
        let speakersObj = {}
        speakerQuery.forEach(query => {
            let speaker = query.data()
            speaker.id = query.id
            speakersObj[speaker.id] = speaker
        })
        return speakersObj
    } else if (livestream.speakers?.length) {
        let speakersObj = {}
        livestream.speakers.forEach(speaker => {
            speakersObj[speaker.id] = speaker
        })
        return speakersObj
    } else {
        return {[uuidv4()]: speakerObj}
    }
}

export const handleAddSpeaker = (values, setValues, speakerObj) => {
    const newValues = {...values}
    newValues.speakers[uuidv4()] = speakerObj
    setValues(newValues)
}

export const handleDeleteSpeaker = (key, values, setCallback) => {
    const newValues = {...values}
    delete newValues.speakers[key]
    setCallback(newValues)
}

export const handleError = (key, fieldName, errors, touched) => {
    const baseError = errors?.speakers?.[key]?.[fieldName]
    const baseTouched = touched?.speakers?.[key]?.[fieldName]
    return baseError && baseTouched && baseError
}