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

export const buildLivestreamObject = (values, targetCategories, updateMode, streamId) => {
    return {
        ...(updateMode && {id: streamId}),// only adds id: livestreamId field if there's actually a valid id, which is when updateMode is true
        backgroundImageUrl: values.backgroundImageUrl,
        company: values.company,
        companyId: values.companyId,
        title: values.title,
        companyLogoUrl: values.companyLogoUrl,
        registeredUsers: [],
        start: firebase.getFirebaseTimestamp(values.start),
        targetGroups: [],
        targetCategories: targetCategories,
        type: 'upcoming',
        test: false,
        groupIds: values.groupIds,
        hidden: values.hidden,
        universities: [],
        summary: values.summary,
        speakers: buildSpeakersArray(values)
    }
}

const buildSpeakersArray = (values) => {
    return Object.keys(values.speakers).map((key) => {
        return {
            id: key,
            avatar: values.speakers[key].avatar,
            background: values.speakers[key].background,
            firstName: values.speakers[key].firstName,
            lastName: values.speakers[key].lastName,
            position: values.speakers[key].position
        }
    });
}

export const handleAddTargetCategories = (arrayOfIds, setTargetCategories, targetCategories) => {
    const oldTargetCategories = {...targetCategories}
    const newTargetCategories = {}
    arrayOfIds.forEach(id => {
        if (!oldTargetCategories[id]) {
            newTargetCategories[id] = []
        } else {
            newTargetCategories[id] = oldTargetCategories[id]
        }
    })
    setTargetCategories(newTargetCategories)
}

export const handleFlattenOptions = (group) => {
    let optionsArray = []
    if (group.categories && group.categories.length) {
        group.categories.forEach(category => {
            if (category.options && category.options.length) {
                category.options.forEach(option => optionsArray.push(option))
            }
        })
    }
    return optionsArray
}