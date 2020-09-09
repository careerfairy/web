import React, {useEffect, useState, Fragment} from 'react'
import CardActions from '@material-ui/core/CardActions';
import {Dropdown, Image, Grid} from 'semantic-ui-react';
import {useRouter} from 'next/router';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withFirebase} from 'data/firebase';
import CircularProgress from '@material-ui/core/CircularProgress';

import {Card, CardContent, CardMedia, Typography, Button} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import AreYouSureModal from "../../../materialUI/GlobalModals/AreYouSureModal";

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    card: {
        flex: 1
    }
});

const CurrentGroup = ({firebase, userData, group, isAdmin}) => {
    const {push} = useRouter()

    const [open, setOpen] = useState(false);

    const handleOpenModal = () => {
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const classes = useStyles()
    const router = useRouter();

    const [userCategories, setUserCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoriesWithElements, setCategoriesWithElements] = useState([]);
    const [deleting, setDeleting] = useState(false)

    const [openUpdateModal, setOpenUpdateModal] = useState(false);

    const material = true

    useEffect(() => {
        if (userData) {
            firebase.listenToUserGroupCategories(userData.userEmail, group.id, querySnapshot => {
                let userCategories = [];
                querySnapshot.forEach(doc => {
                    let category = doc.data();
                    category.id = doc.id;
                    userCategories.push(category);
                });
                setUserCategories(userCategories);
            })
        }
    }, [userData]);

    useEffect(() => {
        firebase.getGroupCategories(group.id).then(querySnapshot => {
            let categories = [];
            querySnapshot.forEach(doc => {
                let category = doc.data();
                category.id = doc.id;
                categories.push(category);
            });
            setCategories(categories);
        })
    }, []);

    useEffect(() => {
        if (categories && categories.length > 0) {
            let categoriesWithElements = [];
            categories.forEach((category, index) => {
                firebase.getGroupCategoryElements(group.id, category.id).then(querySnapshot => {
                    let elements = [];
                    querySnapshot.forEach(doc => {
                        let element = doc.data();
                        element.id = doc.id;
                        elements.push(element);
                    });
                    category.elements = elements;
                    categoriesWithElements.push(category);
                    if (index + 1 === categories.length) {
                        setCategoriesWithElements(categoriesWithElements);
                    }
                });
            });
        }
    }, [categories]);

    const handleDeleteCareerCenter = async () => {
        try {
            setDeleting(true)
            await firebase.deleteCareerCenter(group.id)
            await firebase.deleteCareerCenterFromAllUsers(group.id)
            setDeleting(false)
            setOpen(false)
        } catch (e) {
            console.log("error in career center deletion", e)
            setDeleting(false)
        }
    }

    let categorySelectors = categoriesWithElements.map(category => {
        let usersCategory = userCategories.find(userCategory => {
            return userCategory.categoryId === category.id;
        });
        let value = category.elements.find(element => {
            return element.id === usersCategory?.value;
        })
        return (
            <Grid.Column key={category.id} width={8}>
                <div style={{margin: '15px 0'}}>
                    <label style={{
                        marginBottom: '10px',
                        textTransform: "uppercase",
                        fontSize: '0.8em',
                        fontWeight: '700',
                        color: 'rgb(0, 210, 170)'
                    }}>{category.name}</label>
                    <div style={{fontSize: '1.2em'}}>{value?.name}</div>
                </div>
            </Grid.Column>
        )
    });

    return (
        <Fragment key={group.id}>
            {material ? <Card>
                <CardMedia
                    component="image"
                    className={classes.media}
                    image={group.logoUrl}
                    title="Paella dish"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {group.universityName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        {group.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button fullWidth size="small" color="primary">
                        View Calendar
                    </Button>
                    <Button onClick={handleClick} size="small" color="primary">
                        <MoreVertIcon/>
                    </Button>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={() => push(`/group/${group.id}/admin`)}>Update my data</MenuItem>
                        <MenuItem onClick={() => router.push('/group/' + group.id)}>Group Page</MenuItem>
                        {isAdmin ?
                            <MenuItem onClick={() => setOpen(true)}>Delete group</MenuItem>
                            :
                            <MenuItem onClick={handleClose}>Leave group</MenuItem>}
                        <AreYouSureModal
                            open={open}
                            handleClose={() => setOpen(false)}
                            handleConfirm={handleDeleteCareerCenter}
                            title="Warning"
                            message={`Are you sure you want to delete ${group.universityName}? You wont be able to revert changes`}
                        />
                    </Menu>
                </CardActions>
            </Card> : <Grid.Column width={8}>
                <div className='group-selector'>
                    <Grid className='middle aligned' stackable>
                        <Grid.Column width={8}>
                            <Image src={group.logoUrl} style={{maxHeight: '80px'}}/>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <div style={{fontWeight: '500', color: 'rgb(80,80,80)'}}>{group.description}</div>
                        </Grid.Column>
                    </Grid>
                    <Grid>
                        {categorySelectors}
                    </Grid>
                    <Button.Group style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: '25px',
                        width: '90%',
                        transform: 'translateX(-50%)'
                    }}>
                        <Button icon='calendar alternate outline' content='View Calendar' primary/>
                    </Button.Group>
                    <Dropdown item icon={{name: 'ellipsis vertical', size: 'large', color: 'grey'}}
                              style={{position: 'absolute', right: '10px', top: '20px'}}>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => router.push('/group/' + group.id)}>Update my
                                data</Dropdown.Item>
                            <Dropdown.Item>Leave group</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Grid.Column>}
            <style jsx>{`
                .group-selector {
                    position: relative;
                    border-radius: 15px;
                    background-color: white;
                    box-shadow: 0 0 2px lightgrey;
                    padding: 30px 30px 100px 30px;
                }
            `}</style>
        </Fragment>
    );
};

export default withFirebase(CurrentGroup);