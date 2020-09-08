import React, {useEffect, useState, Fragment} from 'react';
import {IconButton, TextField} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import EditIcon from "@material-ui/icons/Edit";
import {withFirebase} from "../../../../../data/firebase";

const GroupTitle = ({group, menuItem, getCareerCenter, firebase}) => {

    const [editMode, setEditMode] = useState(false)

    const [error, setError] = useState(null)

    const [editData, setEditData] = useState(
        {
            universityName: "",
            fileObj: null,
            logoUrl: ""
        })

    const handleChangeName = (e) => {
        const value = e.target.value
        setEditData({...editData, universityName: value})
    }

    const handleSubmitName = async (e) => {
        e.preventDefault()
        if (editData.universityName.length < 3) return setError("Not long enough")
        await firebase.updateCareerCenter(group.id, {universityName: editData.universityName})
        await getCareerCenter()
        setEditMode(false)
    }

    useEffect(() => {
        if (group) {
            setEditData(group)
        }
    }, [group])


    useEffect(() => {
        if (error && editData.universityName.length > 3) {
            setError(null)
        }
    }, [error, editData])

    return (
        editMode ?
            <Fragment>
                <form style={{display: 'flex'}} onSubmit={handleSubmitName}>
                    <TextField style={{flex: 0.7}}
                               value={editData.universityName}
                               inputProps={{style: {fontSize: 'calc(1.1em + 2vw)'}}}
                               defaultValue={group.universityName}
                               onChange={handleChangeName}
                               error={error}
                               helperText={error}
                    />
                    <div className="edit-btn-wrapper">
                        <IconButton type="submit">
                            <CheckIcon color="primary"/>
                        </IconButton>
                        <IconButton onClick={() => setEditMode(false)}>
                            <ClearIcon color="primary"/>
                        </IconButton>
                    </div>
                </form>
                <style jsx>{`
                        .edit-btn-wrapper {
                          display: flex;
                          align-items: center;
                          flex: 0.3;
                         }
            `}</style>
            </Fragment>
            :
            <Fragment>
                <h1 className='group-name'>{group.universityName}</h1>
                <IconButton onClick={() => setEditMode(true)}>
                    {menuItem === 'settings' && <EditIcon color="primary"/>}
                </IconButton>
                <style jsx>{`
                    .group-name {
                        margin: 20px 0 20px 0;
                        font-weight: 500;
                        font-size: calc(1.1em + 2vw);
                        color: rgb(80,80,80);
                    }
            `}</style>
            </Fragment>
    );
};

export default withFirebase(GroupTitle);
