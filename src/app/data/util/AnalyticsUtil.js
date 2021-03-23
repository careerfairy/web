export default class AnalyticsUtil {

    static getCategoryOptionName = (targetCategoryId, user, groupContext) => {
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

    static mapUserCategories = (user, group) => {
        group.categories.forEach(category => {
            const targetCategoryId = category.id
            if (targetCategoryId) {
                const propertyName = category.name
                user[propertyName] = AnalyticsUtil.getCategoryOptionName(targetCategoryId, user, group)
            }
        })
        return user
    }

    static mapUserEngagement = (user, streams, group) => {
        const categoryUser = AnalyticsUtil.mapUserCategories(user, group)
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

    static mergeArrayOfUsers = (arr1, arr2) => {
        const hash = new Map();
        arr1.concat(arr2).forEach(function (obj) {
            hash.set(obj.userEmail, Object.assign(hash.get(obj.userEmail) || {}, obj))
        });
        return Array.from(hash.values());
    }

    static getTotalUniqueIds = (streams = []) => {
        const totalIds = streams.reduce((mainAcc, {participatingStudents, registeredUsers, talentPool}) => {
            const ids = [participatingStudents, registeredUsers, talentPool].filter(array => array).reduce((acc, curr) => [...acc, ...curr], [])
            return [...mainAcc, ...ids]
        }, [])
        return [...new Set(totalIds)]
    }

    static convertArrayOfUserObjectsToDictionary = (arrayOfUsers) => {
        return Object.assign({}, ...arrayOfUsers.map(user => ({[user.userEmail]: user})))
    }


}
