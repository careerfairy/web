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
import {CardMedia, Fade, Grid, useMediaQuery, useTheme} from "@material-ui/core";


const GroupJoinModal = ({group, firebase, open, userData, closeModal}) => {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [categories, setCategories] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});

    useEffect(() => {
        if (group.categories) {
            const newCategories = group.categories.map(obj => ({...obj, selected: ""}))
            setCategories(newCategories)
        }
    }, [group])

    const handleSetSelected = (categoryId, event) => {
        const newCategories = [...categories]
        const index = newCategories.findIndex(el => el.id === categoryId)
        console.log("event.target.value in func", event.target.value);
        newCategories[index].selected = event.target.value
        setCategories(newCategories)
    }


    function setCategoryValue(categoryId, valueId) {
        let updatedCategories = [];
        categories.forEach(category => {
            if (category.id === categoryId) {
                let elements = [];
                category.elements.forEach(element => {
                    if (element.id === valueId) {
                        element.selected = true;
                    } else {
                        element.selected = false;
                    }
                    elements.push(element);
                });
                category.elements = elements;
            }
            updatedCategories.push(category);
        });
        setCategories(updatedCategories);
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
                            {"has selected?" &&
                            <Button fullWidth variant="contained" size="large"  style={{margin: '10px 0 0 0'}} onClick={closeModal} color="primary" autoFocus>
                                Join
                            </Button>}
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