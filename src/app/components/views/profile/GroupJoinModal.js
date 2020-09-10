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
import {CardMedia, CircularProgress } from "@material-ui/core";


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
            console.log("in the handle join group!")
            setSubmitting(true)
            const newCategories = categories.map(categoryObj => {
                return {
                    id: categoryObj.id,
                    name: categoryObj.name,
                    selectedValueId: categoryObj.selected
                }
            })
            const groupObj = {
                groupId: group.id,
                categories: newCategories
            }
            await firebase.joinGroupNew(userData.id, group.id, groupObj)
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
        <Fragment>
            <Dialog
                open={open}
                onClose={closeModal}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle align="center">Follow live streams from</DialogTitle>
                <CardMedia style={{display: 'flex', justifyContent: 'center', padding: '1em'}}>
                    <img src={group.logoUrl} style={{
                        maxWidth: '250px',
                        width: '35%',
                        maxHeight: '150px'
                    }} alt=""/>
                </CardMedia>
                <DialogContent>
                    <DialogContentText align="center" noWrap id="alert-dialog-description">
                        {group.description}
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{display: 'flex', flexFlow: 'column', alignItems: 'center'}}>
                    {categories.length ?
                        <Fragment>
                            {renderCategories}
                            <Button fullWidth disabled={!allSelected || submitting} variant="contained" size="large"
                                    style={{margin: '10px 0 0 0'}}
                                    endIcon={submitting && <CircularProgress size={20} color="inherit"/>}
                                    onClick={handleJoinGroup} color="primary" autoFocus>
                                Join
                            </Button>
                        </Fragment>
                        :
                        <Button onClick={closeModal} color="primary" autoFocus>
                            Join
                        </Button>
                    }
                </DialogActions>
            </Dialog>
            <style jsx>{`
            .header {
                text-align: center;
                margin-bottom: 40px;
                color: rgb(140,140,140);
                text-transform: uppercase;
            }
        `}</style>
        </Fragment>
    );
};

export default withFirebase(GroupJoinModal);