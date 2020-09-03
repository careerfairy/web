import React, {Fragment, useEffect, useState} from 'react';
import {Button} from "@material-ui/core";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CategoryEdit from "../admin/CategoryEdit";
import CategoryElement from "../admin/CategoryElement";
import AddIcon from "@material-ui/icons/Add";


const CreateCategories = ({handleBack, handleNext, handleReset, setArrayOfCategories, arrayOfCategories, tempId}) => {
    const [categories, setCategories] = useState([]);
    const [createMode, setCreateMode] = useState(false)

    const groupId = "temp"

    useEffect(() => {
        if (arrayOfCategories.length) {
            setCategories(arrayOfCategories);
        }
    }, []);

    const handleAddTempCategory = (categoryObj) => {
        setCategories([...categories, categoryObj])
    }

    const handleUpdateCategory = (categoryObj) => {
        const newCategories = [...categories]
        const indexOfOldObj = categories.findIndex(el => categoryObj.id === el.id)
        newCategories[indexOfOldObj] = categoryObj
        setCategories(newCategories)
    }

    const categoryElements = categories.map((category, index) => {

        return (
            <div key={index}>
                <CategoryElement handleUpdateCategory={handleUpdateCategory} groupId={groupId} category={category}/>
            </div>
        );
    })

    const handleFinish = () => {
        console.log("finished!")
        handleNext()
    }

    return (
        <Fragment>
            <div className="btn-title-wrapper" style={{width: '100%', textAlign: 'left', margin: '0 0 20px 0'}}>
                <h3 className='sublabel'>Add Some Categories</h3>
                <Button variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => setCreateMode(true)}
                        disabled={createMode}
                        endIcon={<AddIcon/>}>
                    Add
                </Button>
            </div>
            {createMode && <CategoryEdit handleAddTempCategory={handleAddTempCategory} groupId={groupId} category={{}} options={[]} newCategory={true} setEditMode={setCreateMode}/>}
            {categoryElements}
            <div className="button-wrapper">
                <Button
                    variant="contained"
                    style={{marginRight: 5}}
                    startIcon={<ArrowBackIcon/>}
                    onClick={handleBack}
                >Back</Button>

                <Button
                    color="primary"
                    variant="contained"
                    style={{marginLeft: 5}}
                    onClick={handleFinish}
                >Confirm</Button>
            </div>

            <style jsx>{`
                .sublabel {
                    text-align: left;
                    display: inline-block;
                    vertical-align: middle;
                    margin: 9px 0;
                    color: rgb(80,80,80);
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
