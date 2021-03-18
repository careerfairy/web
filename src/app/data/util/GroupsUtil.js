export default class GroupsUtil {

    static getGroupCategoryName(categoryId, group) {
        let searchForCategory = group.categories.find( category => category.id === categoryId);
        return searchForCategory.name;
    }

    static getGroupCategoryOptionName(categoryId, optionId, group) {
        let searchForCategory = group.categories.find( category => category.id === categoryId);
        let searchForOption = searchForCategory.options.find( option => option.id === optionId);
        return searchForOption.name;
    }

    static handleFlattenOptions = (group) => {
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

    static getPolicyStatus = async (groups, userEmail, firebase) => {
        let hasAgreedToAll = true
        const updatedGroups = await Promise.all(groups.map(async group => {
            let needsToAgree = false
            if (group.privacyPolicyActive) {
                needsToAgree = await firebase.checkIfUserAgreedToGroupPolicy(group.id, userEmail)
                if (hasAgreedToAll && needsToAgree) {
                    hasAgreedToAll = false
                }
            }
            return ({
                ...group,
                needsToAgree
            })
        }))

        const groupsWithPolicies = updatedGroups.filter(group => group.needsToAgree)

        return {hasAgreedToAll, groupsWithPolicies}
    }
}
