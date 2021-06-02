import PropTypes, {
    shape,
    string,
    oneOf,
    bool,
    number,
    func,
    object,
    arrayOf,
    oneOfType,
    node,
    array,
    any,
    exact
} from 'prop-types';
import {languageCodes} from "../components/helperFunctions/streamFormFunctions";


export const streamType = shape({
    author: shape({
        email: string,
        groupId: string
    }),
    backgroundImageUrl: string,
    company: string,
    companyId: string,
    companyLogoUrl: string,

    currentSpeakerId: string,
    groupIds: array,
    hidden: bool,
    id: string,
    language: shape({
        code: oneOf(languageCodes.map(({code}) => code)),
        name: oneOf(languageCodes.map(({name}) => name))
    }),
    registeredUsers: array,
    talentPool: array,
    participatingStudents: array,
    speakers: array,
    lastUpdated: shape({
        seconds: number,
        nanoseconds: number,
        toDate: func
    }),
    start: shape({
        seconds: number,
        nanoseconds: number,
        toDate: func
    }),
    created: shape({
        seconds: number,
        nanoseconds: number,
        toDate: func
    }),
    summary: string,

    targetCategories: object,
    test: bool,
    title: string,
    type: string,
})

export const streamShape = {
    author: shape({
        email: string,
        groupId: string
    }),
    backgroundImageUrl: string,
    company: string,
    companyId: string,
    companyLogoUrl: string,

    currentSpeakerId: string,
    groupIds: array,
    hidden: bool,
    id: string,
    language: shape({
        code: oneOf(languageCodes.map(({code}) => code)),
        name: oneOf(languageCodes.map(({name}) => name))
    }),
    registeredUsers: array,
    talentPool: array,
    participatingStudents: array,
    speakers: array,
    lastUpdated: shape({
        seconds: number,
        nanoseconds: number,
        toDate: func
    }),
    start: shape({
        seconds: number,
        nanoseconds: number,
        toDate: func
    }),
    created: shape({
        seconds: number,
        nanoseconds: number,
        toDate: func
    }),
    summary: string,

    targetCategories: object,
    test: bool,
    title: string,
    type: string,
}
export const userType = {}

export const groupCategoriesType = arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
}))