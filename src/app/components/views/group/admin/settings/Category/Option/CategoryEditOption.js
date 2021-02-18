import React, {Fragment, useState, useEffect} from 'react';
import {
    Button,
    Typography,
    DialogActions,
    DialogTitle,
    FormHelperText,
    Box,
    Dialog,
    DialogContent,
    TextField,
} from "@material-ui/core";
import {v4 as uuidv4} from 'uuid'
import {Warning} from "@material-ui/icons";

const requiredTxt = "Please fill this field"
const duplicateTxt = "Cannot be a duplicate"

export const AddCategory = ({handleAdd, updateMode, setUpdateMode, open}) => {
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
        setNewOptionName("")
        setUpdateMode({})
    }

    return (
        <Dialog onClose={() => setUpdateMode({})}
                fullWidth
                maxWidth="xs"
                open={open}>
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

export const DeleteCategory = ({setUpdateMode, updateMode, categoryName, handleDeleteCategory, open}) => {
    return (
        <Dialog
            onClose={() => setUpdateMode({})}
            fullWidth
            maxWidth="md"
            open={open}
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
                    <Warning color="error"/><FormHelperText error>This operation cannot be
                    reverted!</FormHelperText><Warning color="error"/>
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

export const RenameOption = ({updateMode, handleRename, setUpdateMode, open}) => {
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
            open={open}
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

export const DeleteOption = ({updateMode, handleDelete, setUpdateMode, open}) => {

    return (
        <Dialog
            open={open}
            onClose={() => setUpdateMode({})}
            fullWidth
            maxWidth="md">
            <DialogTitle className='action'>
                Delete option <strong>{updateMode.option?.name}</strong>
            </DialogTitle>
            <DialogContent>
                <Typography className='explanation'>All your members who are currently classified
                    under <strong>{updateMode.option?.name}</strong> will not anymore belong to any
                    classification
                    until they manually update their categorisation.</Typography>
                <Box display="flex" alignItems="center">
                    <Warning color="error"/><FormHelperText error>This operation cannot be
                    reverted!</FormHelperText><Warning color="error"/>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color="primary"
                        onClick={() => handleDelete(updateMode.option)}
                        variant="contained">
                    Permanently Delete the Category {updateMode.option.name}
                </Button>
                <Button variant="contained" onClick={() => setUpdateMode({})}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

