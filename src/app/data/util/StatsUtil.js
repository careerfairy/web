import { Category } from "@material-ui/icons";

export default class StatsUtil {

    static getStudentInGroupDataObject(student, group) {
        let studentDataObject = {
            'First Name': student.firstName,
            'Last Name': student.lastName,
            'Email': student.userEmail,
            'University': student.universityName ? student.universityName : 'N/A'
        }
        let studentCategoriesForGroup = StatsUtil.getRegisteredGroupById(student, group.groupId)
        if (studentCategoriesForGroup && studentCategoriesForGroup.categories && studentCategoriesForGroup.categories.length && group.categories) {
            group.categories.forEach( category => {
                let studentCatValue = studentCategoriesForGroup.categories.find( studCat => studCat.id === category.id);
                if (studentCatValue) {
                    let studentSelectedOption = category.options.find( option => option.id === studentCatValue.selectedValueId);
                    if (studentSelectedOption) {
                        studentDataObject[category.name] = studentSelectedOption.name;
                    }
                }
            })
        }      
        return studentDataObject;
    }

    static getStudentOutsideGroupDataObject(student, allGroups) {
        let studentMainGroup = allGroups.find( group => {
            if (group.universityCode) {
                return group.universityCode === student.universityCode;
            }
        });
        let studentDataObject = {
            'First Name': student.firstName,
            'Last Name': student.lastName,
            'Email': student.userEmail,
            'University': student.universityName ? student.universityName : 'N/A'
        }
        if (studentMainGroup) {
            let studentCategoriesForGroup = StatsUtil.getRegisteredGroupById(student, studentMainGroup.groupId)
            if (studentCategoriesForGroup && studentCategoriesForGroup.categories && studentCategoriesForGroup.categories.length && studentMainGroup.categories) {
                studentMainGroup.categories.forEach( category => {
                    let studentCatValue = studentCategoriesForGroup.categories.find( studCat => studCat.id === category.id);
                    if (studentCatValue) {
                        let studentSelectedOption = category.options.find( option => option.id === studentCatValue.selectedValueId);
                        if (studentSelectedOption) {
                            studentDataObject[category.name] = studentSelectedOption.name;
                        }
                    }     
                })
            }  
        } else if (student.groupIds && student.groupIds[0]){
            let currentGroup = allGroups.find( group => group.groupId === student.groupIds[0]);
            if (currentGroup) {
                let studentCategoriesForGroup = StatsUtil.getRegisteredGroupById(student, student.groupIds[0])
                if (studentCategoriesForGroup && studentCategoriesForGroup.categories && studentCategoriesForGroup.categories.length && currentGroup.categories) {
                    currentGroup.categories.forEach( category => {
                        let studentCatValue = studentCategoriesForGroup.categories.find( studCat => studCat.id === category.id);
                        if (studentCatValue) {
                            let studentSelectedOption = category.options.find( option => option.id === studentCatValue.selectedValueId);
                            if (studentSelectedOption) {
                                studentDataObject[category.name] = studentSelectedOption.name;
                            }
                        } 
                    })
                }
            }   
        } 
        return studentDataObject;      
    }
    
    static getGroupByUniversityCode(allGroups, universityCode) {
        return allGroups.find( group => group.universityCode === universityCode );
    }

    static getStudentCategories(student, allGroups) {
        let studentMainGroup = StatsUtil.getGroupByUniversityCode(allGroups, student.university);
        if (student.categories && student.registeredGroups[studentMainGroup.groupId]) {
            return StatsUtil.getRegisteredGroupById(student, studentMainGroup.groupId);
        } else {
            return StatsUtil.getRegisteredGroupById(student, student.groupIds[0]);
        }
    }

    static getRegisteredStudentsStats(registeredStudentsFromGroup, group) {
        if (StatsUtil.groupHasSpecializedCategories(group)) {
            return StatsUtil.getSpecializedStudentStats(registeredStudentsFromGroup, group);
        }
        let categoryStats = {};
        if (group.categories && group.length) {
            group.categories.forEach( category => {
                category.options.forEach( option => {
                    if (!categoryStats[category.id]) {
                        categoryStats[category.id] = {};
                    }
                    categoryStats[category.id][option.id] = 0;
                })
                categoryStats[category.id].name = category.name;
            });
            registeredStudentsFromGroup.forEach( student  => {
                let registeredGroup = StatsUtil.getRegisteredGroupById(student, group.groupId);
                if (registeredGroup) {
                    registeredGroup.categories.forEach( category => {
                        categoryStats[category.id][category.selectedValueId] = categoryStats[category.id][category.selectedValueId] + 1;
                    })
                }
            });
        }
        return categoryStats;
    }

    static groupHasSpecializedCategories(group) {
        if (group.categories) {
            let fieldOfStudyCategory = group.categories.find( category => category.name.toLowerCase() === 'field of study');
            let levelOfStudyCategory = group.categories.find( category => category.name.toLowerCase() === 'level of study');
            return fieldOfStudyCategory && levelOfStudyCategory;
        }
        return false;
    }

    static getSpecializedStudentStats(registeredStudentsFromGroup, group) {
        let fieldOfStudyCategory = group.categories.find( category => category.name.toLowerCase() === 'field of study');
        let levelOfStudyCategory = group.categories.find( category => category.name.toLowerCase() === 'level of study');
        let categoryStats = {
            type: 'specialized',
            id: fieldOfStudyCategory.id,
            options: {},
            names: levelOfStudyCategory.options.map( option => option.name )
        };
        fieldOfStudyCategory.options.forEach( option => {
            let optionObj = {
                name: option.name,
                id: levelOfStudyCategory.id,
                entries: 0,
                subOptions: {}
            }
            levelOfStudyCategory.options.forEach( option2 => {
                let option2Obj = {
                    name: option2.name,
                    entries: 0
                }
                optionObj.subOptions[option2.id] = option2Obj;
            })
            categoryStats.options[option.id] = optionObj;
        });
        registeredStudentsFromGroup.forEach( student => {
            let registeredGroup = StatsUtil.getRegisteredGroupById(student, group.groupId);
            let fieldOfStudyOptionId = registeredGroup.categories.find( category => category.id === fieldOfStudyCategory.id)?.selectedValueId;
            let levelOfStudyOptionId = registeredGroup.categories.find( category => category.id === levelOfStudyCategory.id)?.selectedValueId; 
            if (categoryStats.options[fieldOfStudyOptionId] && categoryStats.options[fieldOfStudyOptionId].subOptions[levelOfStudyOptionId]) {
                categoryStats.options[fieldOfStudyOptionId].entries = categoryStats.options[fieldOfStudyOptionId].entries + 1;
                categoryStats.options[fieldOfStudyOptionId].subOptions[levelOfStudyOptionId].entries = categoryStats.options[fieldOfStudyOptionId].subOptions[levelOfStudyOptionId].entries + 1;
            }
            
        })
        return categoryStats;
    }

    static getRegisteredGroupById(student, groupId) {
        return student.registeredGroups?.find( category => category.groupId === groupId);
    }

}
  