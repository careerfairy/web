import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {Chip, TextField} from '@material-ui/core'


const MultiGroupSelect = (
    {
        groups,
        setSelectedGroups,
        setFieldValue,
        handleFlattenOptions,
        selectedGroups,
        handleAddTargetCategories,
        isSubmitting
    }) => {
    const handleMultiSelect = (event, selectedOptions) => {
        const groupIdsArray = selectedOptions.map(option => option.groupId)
        const groupsWithOptions = selectedOptions.map(group => { // if any of the groups from the multi select exists already in the selectedOptions
            handleAddTargetCategories(groupIdsArray)
            const oldGroup = selectedGroups.find(selectedGroup => selectedGroup.groupId === group.groupId)
            if (!oldGroup) { // state, please dont replace it!
                group.flattenedOptions = handleFlattenOptions(group)
                return group
            } else {
                return oldGroup
            }
        })
        setSelectedGroups(groupsWithOptions)
        setFieldValue("groupIds", groupIdsArray)
    }

    return groups.length ? (
        <Autocomplete
            id="groupIds"
            name="groupIds"
            multiple
            disabled={!groups.length || isSubmitting}
            value={selectedGroups}
            options={groups}
            onChange={handleMultiSelect}
            getOptionLabel={(option) => option.universityName}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Add some Groups"
                           placeholder={selectedGroups.length >= groups.length ? "" : "Add some partner Groups"}/>
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip variant="default"
                          label={option.universityName}
                          {...getTagProps({index})}
                    />
                ))
            }
        />
    ) : null;
};

export default MultiGroupSelect;
