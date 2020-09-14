import React, {Fragment, useState, useEffect} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import TextField from '@material-ui/core/TextField';
import {withFirebase} from 'data/firebase';
import {Button, Modal, Typography, DialogActions, DialogTitle, FormHelperText, Box} from "@material-ui/core";
import {v4 as uuidv4} from 'uuid'
import {Warning} from "@material-ui/icons";


function CategoryEditModalOption({updateMode, groupId, setUpdateMode, categoryName, handleDeleteCategory, handleRename, handleAdd, handleDelete}) {

    const requiredTxt = "Please fill this field"
    const duplicateTxt = "Cannot be a duplicate"
    if (!updateMode.mode) {
        return null;
    }

    if (updateMode.mode === 'add') {
        const [newOptionName, setNewOptionName] = useState('');
        const [touched, setTouched] = useState(false)
        const [error, setError] = useState(false)

        useEffect(() => {
            if (!newOptionName.length) {
                setError(requiredTxt)
            }
        }, [touched, newOptionName.length])

        useEffect(() => {
            if (newOptionName.length && updateMode.options.some(el => el.name === newOptionName)) {
                setError(duplicateTxt)
                setTouched(true)
            } else {
                setError(false)
            }
        }, [newOptionName])

        const handleAddModal = (e) => {
            e.preventDefault()
            if (!newOptionName.length) {
                setTouched(true)
                return setError(requiredTxt)
            }
            if (error) return
            const tempId = uuidv4()
            handleAdd({name: newOptionName, id: tempId})
            setUpdateMode({})
        }

        return (
            <Dialog onClose={() => setUpdateMode({})}
                    fullWidth
                    maxWidth="xs"
                    open={updateMode.mode === 'add'}>
                <form onSubmit={handleAddModal}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            label="Add an option"
                            maxLength="20"
                            fullWidth
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            error={Boolean(touched && error.length > 0)}
                            onBlur={() => setTouched(true)}
                            helperText={touched && error}
                            name="option-name"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => setUpdateMode({})}>
                            Cancel
                        </Button>
                        <Button variant="contained" type="submit" color="primary">
                            Confirm
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }

    if (updateMode.mode === 'deleteCategory') {
        return (
            <Dialog
                onClose={() => setUpdateMode({})}
                fullWidth
                maxWidth="md"
                open={updateMode.mode === 'deleteCategory'}
            >
                <DialogTitle>
                    Delete the category <span>{categoryName}</span>
                </DialogTitle>
                <DialogContent>
                    <Typography>All your members who are currently classified
                        under <span>{updateMode.option.name}</span> will not anymore belong to any category until
                        they
                        manually update their categorisation.</Typography>
                    <Box display="flex" alignItems="center">
                        <Warning color="secondary"/><FormHelperText error>This operation cannot be
                        reverted!</FormHelperText><Warning color="secondary"/>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setUpdateMode({})}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteCategory} color="primary"
                            variant="contained">
                        Permanently Delete the Category {categoryName}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    if (updateMode.mode === 'rename') {
        const [newOptionName, setNewOptionName] = useState('');
        const [names, setNames] = useState([])
        const [touched, setTouched] = useState(false)
        const [error, setError] = useState(false)

        useEffect(() => {
            const filteredNames = updateMode.options.filter(el => el.name !== updateMode.option.name)
            setNames(filteredNames)
        }, [])

        useEffect(() => {
            if (!newOptionName.length) {
                setError(requiredTxt)
            }
        }, [touched, newOptionName.length])

        useEffect(() => {
            if (newOptionName.length && names.some(el => el.name === newOptionName)) {
                setError(duplicateTxt)
                setTouched(true)
            } else {
                setError(false)
            }
        }, [newOptionName])

        const handleRenameModal = (e) => {
            e.preventDefault()
            if (!newOptionName.length) {
                setTouched(true)
                return setError(requiredTxt)
            }
            if (error) return
            handleRename({id: updateMode.option.id, name: newOptionName})
            setUpdateMode({})
        }

        return (
            <Dialog
                open={updateMode.mode === 'rename'}
                onClose={() => setUpdateMode({})}
                fullWidth
                maxWidth="md"
            >
                <form onSubmit={handleRenameModal}>
                    <DialogContent>
                        <TextField
                            label={`Rename the option ${updateMode.option.name} to:`}
                            autoFocus
                            fullWidth
                            maxLength="20"
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            error={touched && error.length > 0}
                            onBlur={() => setTouched(true)}
                            helperText={touched && error}
                            name="option-name"
                        />
                        <Typography>All your members who are currently classified
                            under <strong>{updateMode.option.name}</strong> will now be classified
                            under <strong>{newOptionName}</strong>.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => setUpdateMode({})}>
                            Cancel
                        </Button>
                        <Button type="submit" color="primary" variant="contained">
                            Confirm
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        );
    }

    if (updateMode.mode === 'delete') {
        return (
            <Fragment>
                <div className={updateMode.mode ? 'modal' : ''}/>
                <div className='padding animated fadeIn' style={{margin: '20px 0'}}>
                    <div className='action'>
                        Delete option <span>{updateMode.option.name}</span>
                    </div>
                    <p className='explanation'>All your members who are currently classified
                        under <span>{updateMode.option.name}</span> will not anymore belong to any classification
                        until they manually update their categorisation.</p>
                    <p className='explanation warning'>This operation cannot be reverted!</p>
                    <div className='buttons'>
                        <Button style={{marginRight: 10}}
                                onClick={() => handleDelete(updateMode.option)}
                                color="primary"
                                variant="contained">
                            Permanently Delete the Category {updateMode.option.name}
                        </Button>
                        <Button variant="contained" onClick={() => setUpdateMode({})}>
                            Cancel
                        </Button>
                    </div>
                </div>
                <style jsx>{`
    .hidden {
    display: none
    }

    .action {
    font-size: 1.1em;
    }

    .modal {
    position: absolute;
    z-index: 10;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(30,30,30,0.3);
    }

    .padding {
    position: relative;
    z-index: 20;
    background-color: white;
    padding: 20px;
    border-radius: 20px;
    }

    .explanation {
    font-size: 0.9em;
    margin: 10px 0 5px 0;
    }

    .warning {
    color: red;
    margin: 5px 0 20px 0;
    font-weight: 700;
    }

    .explanation span, .action span {
    font-weight: 700;
    }

    .buttons {
    margin: 20px 0;
    }
    `}</style>
            </Fragment>
        );
    }
}

export default withFirebase(CategoryEditModalOption);