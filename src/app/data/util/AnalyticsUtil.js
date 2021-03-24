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
            const propertyName = category.name
            user[propertyName] = getCategoryOptionName(targetCategoryId, user, group)
        }
    })
    return user
}

const mapUserEngagement = (user, streams, group) => {
    const categoryUser = mapUserCategories(user, group)
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
    getTypeOfStudents
}
