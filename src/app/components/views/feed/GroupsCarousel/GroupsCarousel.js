import React, {useEffect, useRef} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupCarouselCard from "./GroupCarouselCard";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Slider from "react-slick";
import {Button, IconButton} from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        "& .slick-track": {
            marginLeft: 0
        },
    },
    button: {
        height: 90,
        borderRadius: 20,
        marginTop: 3,
    },

}));

function NextArrow(props) {
    const {className, style, onClick} = props;
    return (
        <IconButton className="slick-arrow"
                    style={{...style,
                        display: 'block',
                        position: "absolute",
                        right: 0}}
                    onClick={onClick}>
            <NavigateNextIcon/>
        </IconButton>
    );
}

function PrevArrow(props) {
    const {className, style, onClick} = props;
    return (
        <div
            className={className}
            style={{...style, display: "block", background: "red", position: "absolute", left: 0, zIndex: 10}}
            onClick={onClick}
        />
    );
}

const GroupsCarousel = ({groupIds, handleSetGroup, mobile}) => {

    const classes = useStyles()


    const renderGroupCards = groupIds.map(id => {
        return <GroupCarouselCard key={id} handleSetGroup={handleSetGroup} groupId={id}/>
    })
    const handleHowMany = (defaultNum) => {
        let num = defaultNum
        if (renderGroupCards.length < defaultNum) {
            num = renderGroupCards.length + 1
        }
        return num
    }
    const settings = {
        centerMode: true,
        centerPadding: "60px",
        infinite: true,
        slidesToShow: mobile ? 2 : handleHowMany(4),
        speed: 500,
        nextArrow: <NextArrow/>,
        prevArrow: <PrevArrow/>
    };


    const onlyOne = renderGroupCards.length < 2
    console.log("onlyOne", onlyOne);

    return (
        <div>
            <Slider className={classes.root} {...settings}>
                {renderGroupCards}
                <Button className={classes.button} color="primary">
                    Follow more
                </Button>
            </Slider>
        </div>
    )

};

export default GroupsCarousel;
