import React, {Fragment, useEffect, useState} from 'react';
import {Box, Button, Container, Typography} from "@material-ui/core";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CategoryEdit from "../admin/CategoryEdit";
import CategoryElement from "../admin/CategoryElement";
import AddIcon from "@material-ui/icons/Add";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: "50px",
        paddingBottom: "50px"
    },
    title: {
        fontWeight: "300",
        color: "rgb(0, 210, 170)",
        fontSize: "calc(1.2em + 1.5vw)"
    },
    categories: {
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    error: {
        color: "red",
        fontWeight: "lighter",
        fontSize: "1rem"
    },
    header: {
        width: '100%',
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    buttons: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "15px"
    }
}));

const CreateCategories = ({handleBack, handleDeleteLocalCategory, handleUpdateCategory, handleAddTempCategory, handleNext, arrayOfCategories}) => {
    const classes = useStyles()
    const [createMode, setCreateMode] = useState(false)
    const [notEnoughCategories, setNotEnoughCategories] = useState(false)

    useEffect(() => {
        if (!arrayOfCategories.length) {
            setCreateMode(true)
        }
    }, [])

    useEffect(() => {
        if (notEnoughCategories && arrayOfCategories.length > 0) setNotEnoughCategories(false)
    }, [arrayOfCategories.length])
    const groupId = "temp"

    const categoryElements = arrayOfCategories.map((category, index) => {

        return (
            <div key={index}>
                <CategoryElement handleDeleteLocalCategory={handleDeleteLocalCategory} isLocal={true}
                                 handleUpdateCategory={handleUpdateCategory} category={category}/>
            </div>
        );
    })

    const verifyNext = () => {
        if (arrayOfCategories.length < 1) return setNotEnoughCategories(true)
        handleNext()
    }


    return (
        <Fragment>
            <Container className={classes.root}>
                <div className={classes.header}>
                    <Typography className={classes.title}>
                        Add some Categories
                    </Typography>
                    <Button variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => setCreateMode(true)}
                            disabled={createMode}
                            endIcon={<AddIcon/>}>
                        Add
                    </Button>
                </div>
                <Box className={classes.categories}>
                    {createMode &&
                    <CategoryEdit handleAddTempCategory={handleAddTempCategory}
                                  groupId={groupId}
                                  isLocal={true}
                                  category={{}}
                                  options={[]}
                                  newCategory={true}
                                  setEditMode={setCreateMode}/>}
                    {categoryElements}
                    {notEnoughCategories && <Typography className={classes.error}>
                        You need at least one category
                    </Typography>}
                </Box>
                <Box className={classes.buttons}>
                    <Button
                        variant="contained"
                        size='large'
                        style={{marginRight: 5}}
                        startIcon={<ArrowBackIcon/>}
                        onClick={handleBack}
                    >Back</Button>

                    <Button
                        color="primary"
                        size='large'
                        variant="contained"
                        style={{marginLeft: 5}}
                        endIcon={<ArrowForwardIcon/>}
                        onClick={verifyNext}
                    >Next</Button>
                </Box>
            </Container>

            <style jsx>{`
                .sublabel {
                    text-align: left;
                    display: inline-block;
                    vertical-align: middle;
                    margin: 9px 0;
                    color: rgb(80,80,80);
                }
                
                .content-title {
                  text-align: center;
                  font-weight: 300;
                  color: rgb(0, 210, 170);
                  font-size: calc(1.2em + 1.5vw);
                }
                
                .categories-wrapper {
                  display: flex;
                  flex: 1;
                  flex-direction: column;
                }
                
                .content-wrapper {
                  padding: 1rem;
                  min-height: 60vh;
                  display: flex;
                  justify-content: space-between;
                  flex-direction: column;
                }
                
                .error-text {
                  color: red;
                  font-weight: lighter;
                  font-size: 1rem;
                }
                
                .button-wrapper {
                  display: flex;
                  justify-content: center;
                }
                
                .btn-title-wrapper{
                  display: flex;
                  justify-content: space-between;
                }
            `}</style>
        </Fragment>
    )
};

export default CreateCategories;
