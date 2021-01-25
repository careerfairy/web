import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
    Box,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    SvgIcon,
    makeStyles
} from '@material-ui/core';
import {Search as SearchIcon, RefreshCw as RefreshIcon} from 'react-feather';
import {CustomSplitButton} from "../../../../materialUI/GlobalButtons/GlobalButtons";
import {copyStringToClipboard} from "../../../helperFunctions/HelperFunctions";
import {useSnackbar} from "notistack";
import {useAuth} from "../../../../HOCs/AuthProvider";
import IconButton from "@material-ui/core/IconButton";
import {useRouter} from "next/router";

const useStyles = makeStyles((theme) => ({
    root: {},
    importButton: {
        marginRight: theme.spacing(1)
    },
    exportButton: {
        marginRight: theme.spacing(1)
    }
}));

const Toolbar = ({value,group, onChange, className, handleSubmit, handleRefresh, ...rest}) => {
    const {enqueueSnackbar} = useSnackbar()
    const {userData} = useAuth()
    const classes = useStyles();
    const {asPath, push} = useRouter()

    const handleClickDraftNewStream = async () => {
        const groupId = group.id;
        const targetPath = `/draft-stream`;
        // const absolutePath = `/group/${groupId}/admin`;
        return await push({
            pathname: targetPath,
            query: {
                absolutePath: asPath,
                careerCenterIds: groupId,
            },
        });
    };

    const handleCLickCreateNewLivestream = async () => {
        if (canCreateStream()) {
            const targetPath = `/new-livestream`;
            await push({
                pathname: targetPath,
                query: {
                    absolutePath: asPath,
                },
            });
        }
    };

    const canCreateStream = () => {
        return Boolean(userData?.isAdmin || group?.adminEmail === userData?.userEmail);
    };

    const handleShareDraftLink = () => {
        let baseUrl = "https://careerfairy.io";
        if (window?.location?.origin) {
            baseUrl = window.location.origin;
        }
        const groupId = group.id;
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
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SvgIcon
                                                    fontSize="small"
                                                    color="action"
                                                >
                                                    <SearchIcon/>
                                                </SvgIcon>
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleRefresh}>
                                                    <SvgIcon
                                                        fontSize="small"
                                                        color="action"
                                                    >
                                                        <RefreshIcon/>
                                                    </SvgIcon>
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={onChange}
                                    value={value}
                                    placeholder="Search by title, description, hosts or company name"
                                    label="Search streams"
                                    variant="outlined"
                                />
                            </form>
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
