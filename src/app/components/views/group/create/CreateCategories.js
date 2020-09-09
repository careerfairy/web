import React, {Fragment, useEffect, useState} from 'react';
import {Button} from "@material-ui/core";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CategoryEdit from "../admin/CategoryEdit";
import CategoryElement from "../admin/CategoryElement";
import AddIcon from "@material-ui/icons/Add";


const CreateCategories = ({handleBack, handleDeleteLocalCategory, handleUpdateCategory, handleAddTempCategory, handleNext, arrayOfCategories}) => {
    const [createMode, setCreateMode] = useState(false)
    const [notEnoughCategories, setNotEnoughCategories] = useState(false)
    console.log("notEnoughCategories",notEnoughCategories);

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
            <div className="content-wrapper">
                <h1 className='content-title'>Add some Categories</h1>
                <div className="btn-title-wrapper" style={{width: '100%', textAlign: 'left', margin: '0 0 20px 0'}}>
                    <Button variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => setCreateMode(true)}
                            disabled={createMode}
                            endIcon={<AddIcon/>}>
                        Add
                    </Button>
                </div>
                <div className="categories-wrapper">
                    {createMode &&
                    <CategoryEdit handleAddTempCategory={handleAddTempCategory} groupId={groupId} category={{}}
                                  options={[]}
                                  newCategory={true} setEditMode={setCreateMode}/>}
                    {categoryElements}
                    {notEnoughCategories && <p className="error-text">You need at least one category</p>}
                </div>
                <div className="button-wrapper">
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
                        onClick={verifyNext}
                    >Next</Button>
                </div>
            </div>

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
