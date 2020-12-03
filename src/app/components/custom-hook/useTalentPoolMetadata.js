import StatsUtil from 'data/util/StatsUtil';
import { useState, useEffect } from 'react';

export function useTalentPoolMetadata(livestream, allGroups, group, firebase, registeredStudentsFromGroup, userRequestedDownload) {

    const [talentPool, setTalentPool] = useState(undefined);

    const [hasDownloadedTalentPool, setHasDownloadedTalentPool] = useState(false);

    useEffect(() => {
        if (talentPool !== undefined) {
            setHasDownloadedTalentPool(true);
        }  
    }, [talentPool]);

    useEffect(() => {
        if (livestream && userRequestedDownload) {
            firebase.getLivestreamTalentPoolMembers(livestream.companyId).then(querySnapshot => {
                let registeredStudents = [];
                querySnapshot.forEach(doc => {
                    let element = doc.data();
                    if (registeredStudentsFromGroup.some( student => student.Email === doc.id)) {
                        let publishedStudent = StatsUtil.getStudentInGroupDataObject(element, group);
                        registeredStudents.push(publishedStudent);
                    } else {
                        let publishedStudent = StatsUtil.getStudentOutsideGroupDataObject(element, allGroups);
                        registeredStudents.push(publishedStudent);
                    }    
                });
                setTalentPool(registeredStudents);
            })
        }      
    }, [livestream, userRequestedDownload]);
  
    return { hasDownloadedTalentPool, talentPool };
}
