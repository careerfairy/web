import React, {useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
    Box,
    Card,
    CardContent,
    emphasize, Grow,
    InputAdornment,
    makeStyles,
    Slide,
    SvgIcon,
    TextField
} from '@material-ui/core';
import {
    FileText as DraftStreamIcon,
    Film as StreamIcon,
    RefreshCw as RefreshIcon,
    Search as SearchIcon
} from 'react-feather';
import {useSnackbar} from "notistack";
import IconButton from "@material-ui/core/IconButton";
import {useRouter} from "next/router";
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import ShareIcon from '@material-ui/icons/Share';
import {useAuth} from "../../../../../HOCs/AuthProvider";
import {copyStringToClipboard} from "../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles((theme) => ({
    root: {},
    importButton: {
        marginRight: theme.spacing(1)
    },
    exportButton: {
        marginRight: theme.spacing(1)
    },
    speedDial: {
        position: 'absolute',
        top: theme.spacing(16),
        right: theme.spacing(2),
    },
    tooltip: {
        transition: "all 0.8s",
        transitionTimingFunction: theme.transitions.easeInOut,
        whiteSpace: "nowrap",
        boxShadow: theme.shadows[16]
    },
    toolbarCard: {
        width: "calc(100% - 100px)"
    },
    dialButton: {},
    action: {
        margin: 8,
        color: theme.palette.common.white,
        backgroundColor: emphasize(theme.palette.primary.main, 0.12),
        '&:hover': {
            backgroundColor: emphasize(theme.palette.primary.main, 0.15),
        },
        transition: `${theme.transitions.create('transform', {
            duration: theme.transitions.duration.shorter,
        })}, opacity 0.8s`,
        opacity: 1,
    }
}));

const StreamsToolbar = ({value, group, onChange, className, handleSubmit,openNewStreamModal, handleOpenNewStreamModal, handleRefresh, ...rest}) => {
    const {enqueueSnackbar} = useSnackbar()
    const {userData} = useAuth()
    const [open, setOpen] = useState(true);
    const classes = useStyles({open});
    const {asPath, push} = useRouter()

    const toggleOpen = () => {
        setOpen(!open);
    };


    const handleClickDraftNewStream = async () => {
        const groupId = group.id;
        const targetPath = `/draft-stream`;
        return await push({
            pathname: targetPath,
            query: {
                absolutePath: `/group/${groupId}/admin/drafts`,
                careerCenterIds: groupId,
            },
        });
    };

    const handleCLickCreateNewLivestream = async () => {
        if (canCreateStream()) {
            const groupId = group.id;
            const targetPath = `/new-livestream`;
            await push({
                pathname: targetPath,
                query: {
                    absolutePath: `/group/${group.id}/admin/upcoming-livestreams`,
                    groupId
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
            name: "Create a new draft",
            onClick: () => handleClickDraftNewStream(),
            icon: <DraftStreamIcon/>
        },
        {
            name: "Generate a draft link for companies",
            onClick: () => handleShareDraftLink(),
            icon: <ShareIcon/>
        },
    ];

    if (canCreateStream()) {
        buttonOptions.unshift({
            name: "Start drafting a stream",
            onClick: () => handleOpenNewStreamModal(),
            icon: <StreamIcon/>
        });
    }

    return (
        <Slide direction="left" in>
            <div
                className={clsx(classes.root, className)}
                {...rest}
            >
                <SpeedDial
                    ariaLabel="Stream actions"
                    className={classes.speedDial}
                    FabProps={{className: classes.dialButton, onClick: toggleOpen, color: "secondary"}}
                    icon={<SpeedDialIcon/>}
                    direction="down"
                    open={open}
                >
                    {buttonOptions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            FabProps={{
                                size: "large",
                                color: "primary"
                            }}
                            tooltipTitle={action.name}
                            classes={{staticTooltipLabel: classes.tooltip, fab: classes.action}}
                            tooltipOpen
                            onClick={action.onClick}
                            title={action.name}/>
                    ))}
                </SpeedDial>

                <Box mt={3}>
                    <Card className={classes.toolbarCard}>
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
        </Slide>
    );
};

StreamsToolbar.propTypes = {
    className: PropTypes.string
};

export default StreamsToolbar;
