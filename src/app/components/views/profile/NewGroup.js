import React, { useState} from "react";
import {useRouter} from "next/router";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import EditIcon from "@material-ui/icons/Edit";
import {withFirebase} from "data/firebase";
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Typography,
} from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import GroupJoinModal from "./GroupJoinModal";

const NewGroup = ({group, userData}) => {
    const [openJoinModal, setOpenJoinModal] = useState(false);


    const handleCloseJoinModal = () => {
        setOpenJoinModal(false);
    };
    const handleOpenJoinModal = () => {
        setOpenJoinModal(true);
    };

    return (
        <Card>
            <CardMedia
                style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "1.5em 1em 1em 1em",
                    height: "90px",
                }}
            >
                <img
                    src={group.logoUrl}
                    style={{
                        objectFit: "contain",
                        maxWidth: "80%",
                    }}
                    alt=""
                />
            </CardMedia>
            <CardContent style={{height: "115px"}}>
                <Typography align="center" gutterBottom variant="h5" component="h2">
                    {group.universityName}
                </Typography>
                <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                    component="p"
                >
                    {group.description}
                </Typography>
            </CardContent>
            <CardActions>
                {userData.groupIds?.includes(group.id) ? (
                    <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        onClick={handleOpenJoinModal}
                        endIcon={<EditIcon size={20} color="inherit"/>}
                    >
                        Update
                    </Button>
                ) : (
                    <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleOpenJoinModal}
                        endIcon={<GroupAddIcon size={20} color="inherit"/>}
                    >
                        Join
                    </Button>
                )}
            </CardActions>
            <GroupJoinModal
                open={openJoinModal}
                group={group}
                alreadyJoined={userData.groupIds?.includes(group.id)}
                userData={userData}
                closeModal={handleCloseJoinModal}
            />
        </Card>
    );
};

export default withFirebase(NewGroup);
