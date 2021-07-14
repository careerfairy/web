import React from 'react';
import {fade, makeStyles, useTheme} from "@material-ui/core/styles";
import {Avatar, Collapse, Paper} from "@material-ui/core";
import MaterialTable from "material-table";
import {defaultTableOptions, getPageSize, tableIcons} from "../../common/TableUtils";
import EnhancedGroupStreamCard from "../../../events/enhanced-group-stream-card/EnhancedGroupStreamCard";
import {prettyDate} from "../../../../../../helperFunctions/HelperFunctions";
import {useRouter} from "next/router";


const useStyles = makeStyles(theme => ({
    avatar: {
        height: 70,
        width: '80%',
        "& img": {
            objectFit: "contain"
        },
        boxShadow: theme.shadows[1],
        padding: theme.spacing(1),
        background: theme.palette.common.white
    },
    streamManage: {
        background: theme.palette.navyBlue.main,
        color: theme.palette.common.white
    }
}));

const UserInnerTable = ({firstName, lastName, streams, group, registered, firebase}) => {
    const classes = useStyles()
    const theme = useTheme()
    const router = useRouter()
    const customOptions = {...defaultTableOptions}
    const innerTableStyle = {background: fade(theme.palette.navyBlue.main, 0.05)}
    customOptions.selection = false
    customOptions.pageSize = getPageSize(customOptions.pageSizeOptions, streams)
    customOptions.headerStyle = innerTableStyle

    return (
        <Collapse in mountOnEnter unmountOnExit>
            <MaterialTable
                style={innerTableStyle}
                icons={tableIcons}
                title={`Events that ${firstName} ${lastName} ${registered ? "registered to" : "participated in"}:`}
                options={customOptions}
                columns={[
                    {
                        field: "companyLogoUrl",
                        title: "Logo",
                        export: false,
                        render: rowData => (
                            <Avatar className={classes.avatar}
                                    variant="rounded"
                                    src={rowData.companyLogoUrl}/>
                        )
                    },
                    {
                        field: "company",
                        title: "Company"
                    },
                    {
                        field: "title",
                        title: "Title"
                    },
                    {
                        field: "date",
                        title: "Date",
                        type: "date",
                        render: rowData => prettyDate(rowData.start)
                    },
                ]}
                data={streams}
                detailPanel={[
                    {
                        icon: tableIcons.SettingsIcon,
                        tooltip: "Manage Event",
                        render: (rowData) => {
                            return (<Paper className={classes.streamManage} variant="outlined" key={rowData.id}>
                                <EnhancedGroupStreamCard
                                    livestream={rowData}
                                    firebase={firebase}
                                    id={rowData.id}
                                    router={router}
                                    group={group}
                                />
                            </Paper>)
                        }
                    }
                ]}
            />
        </Collapse>
    )
};

export default UserInnerTable;
