import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupCarouselCard from "./GroupCarouselCard";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Slider from "react-slick";
import {Button, IconButton} from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    slider: {
        boxShadow: "0 0 5px grey",
        "& .slick-next:before, .slick-prev:before": {
            content: "'' !important"
        },
        background: "rgb(250, 250, 250)",
        zIndex: 1000,
        position: "sticky",
        top: 0
    },
    button: {
        height: 90,
        borderRadius: 20,
        marginTop: "auto",
    },
}));

function NextArrow({className, style, onClick}) {
    return (
        <div
            className={className}
            style={{
                ...style,
                display: 'block',
                position: "absolute",
                zIndex: 20,
                right: 33,
                top: 34
            }}
            onClick={onClick}
        >
            <IconButton>
                <NavigateNextIcon color="primary" fontSize="large"/>
            </IconButton>
        </div>
    );
}

function PrevArrow({className, style, onClick}) {
    return (
        <div
            className={className}
            style={{
                ...style,
                display: 'block',
                position: "absolute",
                zIndex: 20,
                left: 0,
                top: 34
            }}
            onClick={onClick}
        >
            <IconButton>
                <NavigateBeforeIcon color="primary" fontSize="large"/>
            </IconButton>
        </div>
    );
}

const GroupsCarousel = ({groupIds, handleSetGroup, mobile, groupData}) => {

    const classes = useStyles()


    const renderGroupCards = groupIds?.map((id, index) => {
        return <GroupCarouselCard index={index} mobile={mobile} groupData={groupData} key={id} handleSetGroup={handleSetGroup} groupId={id}/>
    })
    const handleHowMany = (defaultNum) => {
        let num = defaultNum
        if (renderGroupCards.length < defaultNum) {
            num = renderGroupCards.length
        }
        return num
    }
    const settings = {
        centerMode: true,
        centerPadding: "60px",
        infinite: true,
        focusOnSelect:true,
        slidesToScroll: 2,
        slidesToShow: mobile ? 1 : handleHowMany(6),
        speed: 500,
        nextArrow: <NextArrow/>,
        prevArrow: <PrevArrow/>,

    };

    const onlyOne = renderGroupCards.length < 2

    return (
            <Slider className={classes.slider} {...settings}>
                {renderGroupCards}
                {/*<Button className={classes.button} color="primary">*/}
                {/*    Follow more*/}
                {/*</Button>*/}
            </Slider>
    )

};

export default GroupsCarousel;
