import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Avatar, Collapse, Paper} from "@material-ui/core";
import MaterialTable from "material-table";
import {defaultTableOptions, tableIcons} from "../../common/TableUtils";
import EnhancedGroupStreamCard from "../../../events/enhanced-group-stream-card/EnhancedGroupStreamCard";
import {prettyDate} from "../../../../../../helperFunctions/HelperFunctions";

const useStyles = makeStyles(theme => ({
    avatar: {
        height: 70,
        width: '80%',
        "& img": {
            objectFit: "contain"
        },
        boxShadow: theme.shadows[1]
    },
    streamManage:{
        background: theme.palette.navyBlue.main,
        color: theme.palette.common.white
    }
}));

const UserInnerTable = ({firstName, lastName, streams, group, registered}) => {
    const classes = useStyles()
    return (
        <Collapse in mountOnEnter unmountOnExit>
            <MaterialTable
                icons={tableIcons}
                title={`Events that ${firstName} ${lastName} ${registered ? "registered to" : "participated in"}:`}
                options={defaultTableOptions}
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
                detailPanel={[
                    {
                        icon: tableIcons.SettingsIcon,
                        tooltip: "Manage Event",
                        render: (rowData) => {
                            console.log("-> rowData in detail panel of inner table", rowData);
                          return  (<Paper className={classes.streamManage} variant="outlined" key={rowData.id}>
                                <EnhancedGroupStreamCard
                                    livestream={rowData}
                                    firebase={firebase}
                                    id={rowData.id}
                                    group={group}
                                />
                            </Paper>)
                        }
                    }
                ]}
                data={streams}
            />
        </Collapse>
    )
};

export default UserInnerTable;
