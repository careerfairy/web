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
import {CardMedia, useTheme} from "@material-ui/core";


const GroupJoinModal = ({group, firebase, open, userData, closeModal}) => {

    const theme = useTheme();
    const [categories, setCategories] = useState([]);
    const [allSelected, setAllSelected] = useState(false)
    const [selectedOptions, setSelectedOptions] = useState({});

    useEffect(() => {
        if (group.categories) {
            const newCategories = group.categories.map(obj => ({...obj, selected: undefined}))
            setCategories(newCategories)
        }
    }, [group])

    useEffect(() => {
        if (categories) {
            const selected = categories.some(category => category.selected)
            console.log("selected", selected);
            setAllSelected(selected)
        }
    }, [categories])

    const handleSetSelected = (categoryId, event) => {
        const newCategories = [...categories]
        const index = newCategories.findIndex(el => el.id === categoryId)
        newCategories[index].selected = event.target.value
        setCategories(newCategories)
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

                            <Button fullWidth disabled={!allSelected} variant="contained" size="large"
                                    style={{margin: '10px 0 0 0'}}
                                    onClick={closeModal} color="primary" autoFocus>
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