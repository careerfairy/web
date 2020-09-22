import React, {createRef, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupCarouselCard from "./GroupCarouselCard";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Slider from "react-slick";
import {Button, IconButton} from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: 1000,
        position: "sticky",
        top: 0
    },
    slider: {
        boxShadow: "0 0 5px grey",
        "& .slick-next:before, .slick-prev:before": {
            content: "'' !important"
        },
        background: "rgb(250, 250, 250)",

    },
    button: {
        height: 90,
        borderRadius: 20,
        marginTop: "auto",
    },
    next: {
        display: 'block',
        position: "absolute",
        zIndex: 20,
        right: 0,
        WebkitTransform: "translate(-50%,-50%)",
        transform: "translate(-50%,-50%)",
        top: "50%",
    },
    prev: {
        display: 'block',
        position: "absolute",
        zIndex: 20,
        left: 50,
        WebkitTransform: "translate(-50%,-50%)",
        transform: "translate(-50%,-50%)",
        top: "50%",
    }
}));

const GroupsCarousel = ({groupIds, handleSetGroup, mobile, groupData, handleResetGroup}) => {
    const [activeSlide, setActiveSlide] = useState(0)

    const classes = useStyles()
    const customSlider = createRef()

    const handleNext = () => {
        customSlider.current.slickNext()
    }

    const handlePrev = () => {
        customSlider.current.slickPrev()
    }


    const renderGroupCards = groupIds?.map((id, index) => {
        return <GroupCarouselCard index={index} mobile={mobile} handleResetGroup={handleResetGroup}
                                  activeSlide={activeSlide}
                                  groupData={groupData} key={id} handleSetGroup={handleSetGroup} groupId={id}/>
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
        focusOnSelect: true,
        initialSlide: 0,
        slidesToScroll: 1,
        slidesToShow: mobile ? 1 : handleHowMany(5),
        speed: 500,
        beforeChange: (current, next) => setActiveSlide(next),
    };

    return (
        <div className={classes.root}>
            <IconButton className={classes.prev} onClick={handlePrev}>
                <NavigateBeforeIcon color="primary" fontSize="large"/>
            </IconButton>
            <Slider ref={customSlider} className={classes.slider} {...settings}>
                {renderGroupCards}
                {/*<Button className={classes.button} color="primary">*/}
                {/*    Follow more*/}
                {/*</Button>*/}
            </Slider>
            <IconButton className={classes.next} onClick={handleNext}>
                <NavigateNextIcon color="primary" fontSize="large"/>
            </IconButton>
        </div>
    )

};

export default GroupsCarousel;
