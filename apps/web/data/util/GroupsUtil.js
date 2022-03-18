export default class GroupsUtil {
   static getGroupCategoryName(categoryId, group) {
      let searchForCategory = group.categories.find(
         (category) => category.id === categoryId
      )
      return searchForCategory.name
   }

   static getGroupCategoryOptionName(categoryId, optionId, group) {
      let searchForCategory = group.categories.find(
         (category) => category.id === categoryId
      )
      let searchForOption = searchForCategory.options.find(
         (option) => option.id === optionId
      )
      return searchForOption.name
   }

   static filterCurrentGroup = (currentGroup, targetGroupId) => {
      // If there is no target groupId it means we dont need to hide other groups so return everything/true
      if (!targetGroupId) return true

      // If there is a target group, we only want to return the target group
      return currentGroup?.groupId === targetGroupId
   }

   static handleFlattenOptions = (group) => {
      let optionsArray = []
      if (group.categories && group.categories.length) {
         group.categories.forEach((category) => {
            if (category.options && category.options.length) {
               category.options.forEach((option) => optionsArray.push(option))
            }
         })
      }
      return optionsArray
   }

   static checkIfUserFollows = ({ authenticatedUser, userData }, group) => {
      if (
         authenticatedUser.isLoaded &&
         !authenticatedUser.isEmpty &&
         userData &&
         userData.groupIds
      ) {
         const { id } = group
         return userData.groupIds.includes(id)
      } else {
         return false
      }
   }

   static getUniqueGroupsFromArrayOfGroups = (groups = []) => {
      return groups.filter(function (el) {
         if (!this[el.groupId]) {
            this[el.groupId] = true
            return true
         }
         return false
      }, Object.create(null))
   }

   static getPolicyStatus = async (
      groups,
      userEmail,
      checkIfUserAgreedToGroupPolicy
   ) => {
      let hasAgreedToAll = true
      const updatedGroups = await Promise.all(
         groups.map(async (group) => {
            let needsToAgree = false
            if (group.privacyPolicyActive) {
               needsToAgree = await checkIfUserAgreedToGroupPolicy(
                  group.id,
                  userEmail
               )
               if (hasAgreedToAll && needsToAgree) {
                  hasAgreedToAll = false
               }
            }
            return {
               ...group,
               needsToAgree,
            }
         })
      )

      const groupsWithPolicies = updatedGroups.filter(
         (group) => group.needsToAgree
      )

      return { hasAgreedToAll, groupsWithPolicies }
   }

   static userNeedsToFollowAGroup = (userData, livestream) => {
      if (!livestream.groupIds?.length) return false
      if (userData.groupIds && livestream.groupIds) {
         // are you following any group thats part of this livstream?
         return userData.groupIds.some(
            (id) => livestream.groupIds.indexOf(id) >= 0
         )
      } else {
         return false
      }
   }
}
