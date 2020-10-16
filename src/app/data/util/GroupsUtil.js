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
}
