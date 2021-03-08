import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Box, Button, Card, CardContent, CardHeader, Divider, Grid, Grow} from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import CategoryElement from "../settings/Category/CategoryElement";
import CategoryEdit from "../settings/Category/CategoryEdit";


const ProfileCategories = ({group, firebase, className, isCompany, ...rest}) => {
        const [createMode, setCreateMode] = useState(false);

        return (

            <Card>
                <Box
                    display="flex"
                    justifyContent="space-between"
                >
                    <CardHeader
                        subheader="The information can be edited"
                        title="Categories"
                    />
                    <Box p={2} display="flex" alignItems="flex-end">
                        <Button variant="contained"
                                color="primary"
                                size="medium"
                                onClick={() => setCreateMode(true)}
                                disabled={createMode}
                                endIcon={<AddIcon/>}>
                            Add Category
                        </Button>
                    </Box>
                </Box>
                <Divider/>
                <CardContent>
                    <Grid
                        container
                        spacing={3}
                    >
                        <Grow unmountOnExit in={createMode}>
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
                                <CategoryEdit
                                    group={group}
                                    category={{}}
                                    options={[]}
                                    isCompany={isCompany}
                                    newCategory={true}
                                    setEditMode={setCreateMode}/>
                            </Grid>
                        </Grow>

                        {group.categories?.map((category) => {
                            return (
                                <Grid
                                    key={category.id}
                                    item
                                    md={12}
                                    xs={12}
                                >
                                    <CategoryElement  isCompany={isCompany} group={group} category={category}/>
                                </Grid>
                            );
                        })}
                    </Grid>
                </CardContent>
                <Divider/>

            </Card>
        );
    }
;

ProfileCategories.propTypes = {
  className: PropTypes.string,
  firebase: PropTypes.object,
  group: PropTypes.object,
  isCompany: PropTypes.bool
}

export default ProfileCategories;
