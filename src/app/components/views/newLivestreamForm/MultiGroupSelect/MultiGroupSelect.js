import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {TextField} from '@material-ui/core'


const MultiGroupSelect = ({value, values, groups, handleBlur, handleChange, setFieldValue}) => {

    const handleMultiSelect = (event, selectedOptions) => {
        const groupIdsArray = selectedOptions.map(option => option.groupId)
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
                <TextField {...params} variant="outlined" label="Add some Universities" placeholder="Favorites"/>
            )}
        />
    ) : null;
};

export default MultiGroupSelect;
