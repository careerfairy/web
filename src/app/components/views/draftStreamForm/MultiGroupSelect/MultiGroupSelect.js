import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';
import {TextField} from '@material-ui/core'
import {handleAddTargetCategories} from "../../../helperFunctions/streamFormFunctions";


const MultiGroupSelect = (
    {
        groups,
        targetCategories,
        setSelectedGroups,
        setFieldValue,
        handleFlattenOptions,
        setTargetCategories,
        selectedGroups,
        isSubmitting,
        groupId,
        isNotAdmin
    }) => {
    const handleMultiSelect = (event, selectedOptions) => {
        let groupIdsArray = selectedOptions.map(option => option.groupId)
        let groupsWithOptions = selectedOptions.map(group => { // if any of the groups from the multi select exists already in the selectedOptions
            handleAddTargetCategories(groupIdsArray, setTargetCategories, targetCategories)
            const oldGroup = selectedGroups.find(selectedGroup => selectedGroup.groupId === group.groupId)
            if (!oldGroup) { // state, please dont replace it!
                group.flattenedOptions = handleFlattenOptions(group)
                return group
            } else {
                return oldGroup
            }
        })
        if (groupId) {
            const fixedGroupWithOptions = groups.find(group => group.groupId === groupId)
            const fixedGroupId = fixedGroupWithOptions?.groupId
            if (fixedGroupId) {
                groupIdsArray = [fixedGroupId, ...groupIdsArray.filter(groupIdString => groupIdString !== groupId)]
                groupsWithOptions = [fixedGroupWithOptions, ...groupsWithOptions.filter(group => group.groupId !== groupId)]
            }
        }
        setSelectedGroups(groupsWithOptions)
        setFieldValue("groupIds", groupIdsArray)
    }

    return groups.length ? (
        <Autocomplete
            id="groupIds"
            name="groupIds"
            multiple
            disabled={!groups.length || isSubmitting || isNotAdmin}
            value={selectedGroups}
            options={groups}
            onChange={handleMultiSelect}
            getOptionLabel={(option) => option.universityName}
            // getOptionDisabled={(option) => option.groupId === groupId}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Add some Groups"
                           placeholder={selectedGroups.length >= groups.length ? "" : "Add some partner Groups"}/>
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                        <Chip variant="default"
                              label={option.universityName}
                              {...getTagProps({index})}
                              disabled={(option.groupId === groupId) || isNotAdmin}
                        />
                    )
                )
            }
        />
    ) : null;
};

export default MultiGroupSelect;
