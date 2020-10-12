import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {Chip, TextField} from '@material-ui/core'


const MultiGroupSelect = ({groups, setSelectedGroups, setFieldValue}) => {

    const handleMultiSelect = (event, selectedOptions) => {

        const groupIdsArray = selectedOptions.map(option => option.groupId)
        setSelectedGroups(selectedOptions)
        setFieldValue("groupIds", groupIdsArray)
    }

    return groups.length ? (
        <Autocomplete
            id="groupIds"
            name="groupIds"
            multiple
            options={groups}
            onChange={handleMultiSelect}
            getOptionLabel={(option) => option.universityName}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" label="Add some Universities"
                           placeholder="Add partner groups"/>
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip color="primary"
                        variant="default"
                        label={option.universityName}
                        {...getTagProps({index})}
                    />
                ))
            }
        />
    ) : null;
};

export default MultiGroupSelect;
