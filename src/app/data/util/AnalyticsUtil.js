import {toTitleCase} from "../../components/helperFunctions/HelperFunctions";

const getCategoryOptionName = (targetCategoryId, user, groupContext) => {
    if (user.registeredGroups) {
        const targetGroup = user.registeredGroups.find(groupObj => groupObj.groupId === groupContext.groupId)
        if (targetGroup?.categories) {
            const targetCategory = targetGroup.categories.find(categoryObj => categoryObj.id === targetCategoryId)
            if (targetCategory?.selectedValueId) {
                const targetOption = groupContext.options.find(option => option.id === targetCategory.selectedValueId)
                if (targetOption?.name) {
                    return targetOption.name
                }
            }
        }
    }
}

const mapUserCategories = (user, group) => {
    group.categories.forEach(category => {
        const targetCategoryId = category.id
        if (targetCategoryId) {
            const propertyName = toTitleCase(category.name)
            if (!user[propertyName]) {
                const categoryOptionName = getCategoryOptionName(targetCategoryId, user, group) || ""
                user[propertyName] = toTitleCase(categoryOptionName.toLowerCase())
            }
        }
    })
    return user
}

const mapUserEngagement = (user, streams, group, requestingCompanyGroup) => {
    let categoryUser = user
    categoryUser = mapUserCategories(user, group)
    if (requestingCompanyGroup) {
        // Try and map the requesting company's categories to the user
        categoryUser = mapUserCategories(user, requestingCompanyGroup)
    }
    categoryUser.watchedEvent = false
    const registeredStreams = []
    const watchedStreams = []

    const currentUserEmail = categoryUser.userEmail

    if (currentUserEmail) {
        streams.forEach(stream => {
            if (stream?.participatingStudents?.some(userEmail => userEmail === currentUserEmail)) {
                watchedStreams.push(stream)
                categoryUser.watchedEvent = true
            }
            if (stream?.registeredUsers?.some(userEmail => userEmail === currentUserEmail)) {
                registeredStreams.push(stream)
            }
        })
    }
    categoryUser.numberOfStreamsWatched = watchedStreams.length
    categoryUser.streamsWatched = watchedStreams
    categoryUser.numberOfStreamsRegistered = registeredStreams.length
    categoryUser.streamsRegistered = registeredStreams
    return categoryUser
}

const mergeArrayOfUsers = (arr1, arr2) => {
    const hash = new Map();
    arr1.concat(arr2).forEach(function (obj) {
        hash.set(obj.userEmail, Object.assign(hash.get(obj.userEmail) || {}, obj))
    });
    return Array.from(hash.values());
}

const getTotalUniqueIds = (streams = []) => {
    const totalIds = streams.reduce((mainAcc, {participatingStudents, registeredUsers, talentPool}) => {
        const ids = [participatingStudents, registeredUsers, talentPool].filter(array => array).reduce((acc, curr) => [...acc, ...curr], [])
        return [...mainAcc, ...ids]
    }, [])
    return [...new Set(totalIds)]
}

const convertArrayOfUserObjectsToDictionary = (arrayOfUsers) => {
    return Object.assign({}, ...arrayOfUsers.map(user => ({[user.userEmail]: user})))
}

const getTotalEmailsFromStreamsByProperty = (streamsArray, prop) => {
    return streamsArray.reduce(
        (accumulator, livestream) =>
            livestream?.[prop]?.length ? accumulator.concat(livestream[prop]) : accumulator,
        []
    );
}

const getUniqueIds = (arrayOfIds) => {
    return [...new Set(arrayOfIds)]
}


const getUniqueUsers = (streamsArray, prop) => {
    const totalViewers = getTotalEmailsFromStreamsByProperty(streamsArray, prop)
    // new Set method removes all duplicates from array
    return totalViewers.filter(function (el) {
        if (!this[el.userEmail]) {
            this[el.userEmail] = true;
            return true;
        }
        return false;
    }, Object.create(null));
};

const getUniqueUsersByEmailWithArrayOfUsers = (ArrayOfUsers = []) => {
    return ArrayOfUsers.filter(function (el) {
        if (!this[el.userEmail]) {
            this[el.userEmail] = true;
            return true;
        }
        return false;
    }, Object.create(null))
}

const getAggregateCategories = (participants, group) => {
    let categories = []
    participants.forEach(user => {
        const matched = user.registeredGroups?.find(groupData => groupData.groupId === group.id)
        if (matched) {
            categories.push(matched)
        }
    })
    return categories
}

const getTypeOfStudents = (prop, {currentStream, streamsFromTimeFrameAndFuture, group, currentCategory}) => {
    let students = []
    if (currentStream?.[prop]) {
        students = currentStream[prop]
    } else {//Get total Students
        students = getUniqueUsers(streamsFromTimeFrameAndFuture, prop)
    }
    const aggregateCategories = getAggregateCategories(students, group)
    const flattenedGroupOptions = currentCategory.options.map(option => {
        const count = aggregateCategories.filter(category => category.categories.some(userOption => userOption.selectedValueId === option.id)).length
        return {...option, count}
    })
    return flattenedGroupOptions.sort((a, b) => b.count - a.count);
}

const getTotalUniqueStreamGroupIdsFromStreams = (arrayOfStreams = []) => {
    const totalIds = arrayOfStreams.reduce((acc, curr) => curr.groupIds ? acc.concat(curr.groupIds) : acc, [])
    return [...new Set(totalIds)]
}

const arraysOfIdsEqual = (array1, array2) => {
    if (array1 === array2) return true;
    if (array1 == null || array2 == null) return false;
    if (array1.length !== array2.length) return false;

    const array1Sorted = [...array1].sort()
    const array2Sorted = [...array2].sort()

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (let i = 0; i < array1Sorted.length; ++i) {
        if (array1Sorted[i] !== array2Sorted[i]) return false;
    }
    return true;
}

module.exports = {
    mapUserEngagement,
    getUniqueIds,
    getTotalEmailsFromStreamsByProperty,
    getUniqueUsers,
    mergeArrayOfUsers,
    convertArrayOfUserObjectsToDictionary,
    getCategoryOptionName,
    getTotalUniqueIds,
    mapUserCategories,
    getAggregateCategories,
    getTypeOfStudents,
    getTotalUniqueStreamGroupIdsFromStreams,
    arraysOfIdsEqual,
    getUniqueUsersByEmailWithArrayOfUsers
}
