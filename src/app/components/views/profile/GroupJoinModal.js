import {Fragment, useState, useEffect} from 'react'
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {withFirebase} from 'data/firebase';
import UserCategorySelector from 'components/views/profile/UserCategorySelector';
import {Card, CardMedia, CircularProgress} from "@material-ui/core";


const GroupJoinModal = ({group, firebase, open, closeModal, userData}) => {

    const [categories, setCategories] = useState([]);
    const [allSelected, setAllSelected] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (group.categories) {
            const newCategories = group.categories.map(obj => ({...obj, selected: ""}))
            setCategories(newCategories)
        }
    }, [group])

    useEffect(() => {
        if (categories && open) {
            const notAllSelected = !categories.some(category => category.selected === "")
            setAllSelected(notAllSelected)
        }
    }, [categories, open])

    const handleSetSelected = (categoryId, event) => {
        const newCategories = [...categories]
        const index = newCategories.findIndex(el => el.id === categoryId)
        newCategories[index].selected = event.target.value
        setCategories(newCategories)
    }

    const handleJoinGroup = async () => {
        try {
            setSubmitting(true)
            const newCategories = categories.map(categoryObj => {
                return {
                    id: categoryObj.id,
                    selectedValueId: categoryObj.selected
                }
            })
            const groupObj = {
                groupId: group.id,
                categories: newCategories
            }
            await firebase.joinGroup(userData.id, group.id, groupObj)
            setSubmitting(false)
            closeModal()
        } catch (e) {
            console.log("error in handle join", e)
            setSubmitting(false)
        }
    }

    const renderCategories = categories.map((category, index) => {
        return (
            <Fragment key={category.id}>
                <UserCategorySelector handleSetSelected={handleSetSelected} index={index} category={category}/>
            </Fragment>
        )
    })

    return (
        <Dialog
            open={open}
            onClose={closeModal}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle align="center">Follow live streams from</DialogTitle>
            <CardMedia
                style={{display: 'flex', justifyContent: 'center', padding: '1.5em 1em 1em 1em', height: '120px'}}>
                <img src={group.logoUrl} style={{
                    objectFit: 'contain',
                    maxWidth: '80%'
                }} alt=""/>
            </CardMedia>
            <DialogContent>
                <DialogContentText align="center" noWrap id="alert-dialog-description">
                    {group.description}
                </DialogContentText>
            </DialogContent>
            <DialogActions style={{display: 'flex', flexFlow: 'column', alignItems: 'center'}}>
                {!!categories.length && renderCategories}
                <div style={{display: 'flex', width: '100%', margin: 0}}>
                    <Button fullWidth
                            // variant="contained"
                            size="large"
                            style={{margin: '10px 5px 0 0'}}
                            endIcon={submitting && <CircularProgress size={20} color="inherit"/>}
                            onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button fullWidth
                            disabled={!allSelected || submitting}
                            variant="contained"
                            size="large"
                            style={{margin: '10px 0 0 5px'}}
                            endIcon={submitting && <CircularProgress size={20} color="inherit"/>}
                            onClick={handleJoinGroup} color="primary" autoFocus>
                        Join
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default withFirebase(GroupJoinModal);