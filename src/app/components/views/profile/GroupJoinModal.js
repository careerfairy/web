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
import {CardMedia, Grid} from "@material-ui/core";
import Select from "@material-ui/core/Select";

const GroupJoinModal = ({group, firebase, open, userData, closeModal}) => {

    const [categories, setCategories] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    console.log("categories", categories);

    useEffect(() => {
        if (group.categories) {
            setCategories(group.categories)

            setSelectedOptions()

        }
    }, [group])


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

    const renderCategories = categories.map(category => {
        return (
            <Fragment>
                <UserCategorySelector category={category}/>
            </Fragment>
        )
    })

    return (
        <Fragment>
            <Dialog
                open={open}
                onClose={closeModal}
                maxWidth="xl"
                // fullWidth
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Follow live streams from</DialogTitle>
                <CardMedia style={{display: 'flex', justifyContent: 'center', padding: '1em'}}>
                    <img src={group.logoUrl} style={{
                        maxWidth: '250px',
                        width: '35%',
                        maxHeight: '150px'
                    }} alt=""/>
                </CardMedia>
                <DialogContent>
                    <DialogContentText align="center" id="alert-dialog-description">
                        {group.description}
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{display: 'flex', flexFlow: 'column'}}>
                    {categories.length ?
                        <div>
                            {renderCategories}
                            {"has selected?" && <Button onClick={closeModal} color="primary" autoFocus>
                                Join
                            </Button>}
                        </div>
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