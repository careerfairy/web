export default class StatsUtil {
    
    static getGroupByUniversityCode(allGroups, universityCode) {
        return allGroups.find( group => group.universityCode === universityCode );
    }

    static getStudentCategories(student, universityCode, allGroups) {
        let studentMainGroup = StatsUtil.getGroupByUniversityCode(allGroups, student.university);
        if (student.categories && student.categories[studentMainGroup.groupId]) {
            return student.categories[studentMainGroup.groupId];
        } else {
            return student.categories[student.groupIds[0]];
        }
    }

    static getRegisteredStudentsStats(registeredStudentsFromGroup, group) {
        let categoryStats = {};
        group.categories.forEach( category => {
            category.options.forEach( option => {
                categoryStats[category.id][option.id] = 0;
            })
        });
        registeredStudentsFromGroup.forEach( student  => {
            let registeredGroup = StatsUtil.getRegisteredGroupById(student, groupId);
            if (registeredGroup) {
                registeredGroup.categories.forEach( category => {
                    categoryStats[category.id][category.selectedValueId] = categoryStats[category.id][category.selectedValueId] + 1;
                })
            }
        });
        return categoryStats;
    }

    static getRegisteredGroupById(student, groupId) {
        return student.registeredCategories.find( category => category.groupId === groupId);
    }

}
  