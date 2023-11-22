import {
   Avatar,
   Card,
   CardActionArea,
   CardHeader,
   IconButton,
   Typography,
} from "@mui/material"
import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import EditIcon from "@mui/icons-material/Edit"
import clsx from "clsx"

const useStyles = makeStyles((theme) => ({
   root: {
      width: 200,
   },
   cover: {
      height: 300,
      width: "100%",
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
   },
   selected: {
      border: `4px solid ${theme.palette.primary.main}`,
   },
}))

const EmailTemplateCard = ({
   templateImageUrl,
   templateName,
   templateEditUrl,
   onClick,
   selected,
}) => {
   const classes = useStyles()
   return (
      <Card
         className={clsx(classes.root, {
            [classes.selected]: selected,
         })}
      >
         <CardActionArea onClick={onClick}>
            <CardHeader
               action={
                  <IconButton
                     href={templateEditUrl}
                     target="_blank"
                     aria-label="edit-template"
                     size="large"
                  >
                     <EditIcon />
                  </IconButton>
               }
               title={
                  <Typography variant="h6" color="textSecondary">
                     {templateName}
                  </Typography>
               }
            />
            <Avatar
               className={classes.cover}
               src={templateImageUrl}
               title={templateName}
               variant="square"
            />
         </CardActionArea>
      </Card>
   )
}

export default EmailTemplateCard
