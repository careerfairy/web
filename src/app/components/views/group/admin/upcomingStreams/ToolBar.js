import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    SvgIcon,
    makeStyles
} from '@material-ui/core';
import { Search as SearchIcon } from 'react-feather';
import {CustomSplitButton} from "../../../../../materialUI/GlobalButtons/GlobalButtons";
import {copyStringToClipboard} from "../../../../helperFunctions/HelperFunctions";
import {useSnackbar} from "notistack";
import {useAuth} from "../../../../../HOCs/AuthProvider";

const useStyles = makeStyles((theme) => ({
    root: {},
    importButton: {
        marginRight: theme.spacing(1)
    },
    exportButton: {
        marginRight: theme.spacing(1)
    }
}));

const Toolbar = ({ className, ...rest }) => {
    const {enqueueSnackbar} = useSnackbar()
    const {userData} = useAuth()
    const classes = useStyles();

    const handleClickDraftNewStream = async () => {
        const groupId = props.group.id;
        const targetPath = `/draft-stream`;
        const absolutePath = `/group/${groupId}/admin`;
        return await router.push({
            pathname: targetPath,
            query: {
                absolutePath,
                careerCenterIds: groupId,
            },
        });
    };

    const handleCLickCreateNewLivestream = async () => {
        const groupId = props.group.id;
        const absolutePath = `/group/${groupId}/admin`;
        if (userData?.isAdmin) {
            const targetPath = `/new-livestream`;
            await router.push({
                pathname: targetPath,
                query: {
                    absolutePath,
                },
            });
        }
    };

    const canCreateStream = () => {
        return Boolean(userData?.isAdmin);
    };

    const handleShareDraftLink = () => {
        let baseUrl = "https://careerfairy.io";
        if (window?.location?.origin) {
            baseUrl = window.location.origin;
        }
        const groupId = props.group.id;
        const targetPath = `${baseUrl}/draft-stream?careerCenterIds=${groupId}`;
        copyStringToClipboard(targetPath);
        enqueueSnackbar("Link has been copied to your clipboard", {
            variant: "default",
            preventDuplicate: true,
        });
    };

    const buttonOptions = [
        {
            label: "Create a new draft",
            onClick: () => handleClickDraftNewStream(),
        },
        {
            label: "Generate a sharable draft link",
            onClick: () => handleShareDraftLink(),
        },
    ];

    if (canCreateStream()) {
        buttonOptions.unshift({
            label: "Create a live stream",
            onClick: () => handleCLickCreateNewLivestream(),
        });
    }

    return (
        <div
            className={clsx(classes.root, className)}
            {...rest}
        >
            <Box
                display="flex"
                justifyContent="flex-end"
            >
                <CustomSplitButton
                    slideDirection="left"
                    className={classes.buttonGroup}
                    size="large"
                    options={buttonOptions}
                />
            </Box>
            <Box mt={3}>
                <Card>
                    <CardContent>
                        <Box maxWidth={500}>
                            <TextField
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SvgIcon
                                                fontSize="small"
                                                color="action"
                                            >
                                                <SearchIcon />
                                            </SvgIcon>
                                        </InputAdornment>
                                    )
                                }}
                                placeholder="Search streams"
                                variant="outlined"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </div>
    );
};

Toolbar.propTypes = {
    className: PropTypes.string
};

export default Toolbar;
