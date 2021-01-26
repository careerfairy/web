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
