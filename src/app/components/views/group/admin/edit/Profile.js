import React, {useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Divider,
    Typography,
    makeStyles, FormHelperText
} from '@material-ui/core';
import FilePickerContainer from "../../../../ssr/FilePickerContainer";
import PublishIcon from "@material-ui/icons/Publish";
import ImagePickerContainer from "../../../../ssr/ImagePickerContainer";

const user = {
    avatar: '/static/images/avatars/avatar_6.png',
    city: 'Los Angeles',
    country: 'USA',
    jobTitle: 'Senior Developer',
    name: 'Katarina Smith',
    timezone: 'GTM-7'
};

const useStyles = makeStyles(() => ({
    root: {},
    avatar: {
        height: "100%",
        width: "100%",
        "& img": {
            objectFit: "contain"
        }
    },
    actionsWrapper:{
        display: "flex",
        flexDirection: "column",
    }
}));

const Profile = ({group, className, ...rest}) => {
    const classes = useStyles();
    const [editData, setEditData] = useState(false);
    const [filePickerError, setFilePickerError] = useState('');
    console.log("-> group", group);

    return (
        <Card
            className={clsx(classes.root, className)}
            {...rest}
        >
            <CardContent>
                <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="column"
                >
                    <Avatar
                        variant="rounded"
                        className={classes.avatar}
                        src={group.logoUrl}
                    />
                    <Typography
                        color="textPrimary"
                        gutterBottom
                        align="center"
                        variant="h3"
                    >
                        {group.universityName}
                    </Typography>
                    <Typography
                        color="textSecondary"
                        variant="body1"
                    >
                        {group.description}
                    </Typography>
                </Box>
            </CardContent>
            <Divider/>
            <CardActions className={classes.actionsWrapper}>
                {/*<Button*/}
                {/*  color="primary"*/}
                {/*  fullWidth*/}
                {/*  variant="text"*/}
                {/*>*/}
                {/*  Upload picture*/}
                {/*</Button>*/}
                <ImagePickerContainer
                    extensions={["jpg", "jpeg", "png"]}
                    dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
                    maxSize={20}
                    onChange={(fileObject) => {
                        setFilePickerError(null);
                        setEditData({
                            ...editData,
                            fileObj: fileObject,
                            logoUrl: URL.createObjectURL(fileObject),
                        });
                    }}
                    onError={(errMsg) => setFilePickerError(errMsg)}>
                    {/*<Box flexDirection="column" display="flex" alignItems="center">*/}
                        <Button
                            style={{margin: "10px"}}
                            color="primary"
                            size="large"
                            fullWidth
                            endIcon={<PublishIcon/>}>
                            Upload Logo
                        </Button>
                    {/*</Box>*/}
                </ImagePickerContainer>
                <FormHelperText error>{filePickerError}</FormHelperText>
            </CardActions>
        </Card>
    );
};

Profile.propTypes = {
    className: PropTypes.string
};

export default Profile;
