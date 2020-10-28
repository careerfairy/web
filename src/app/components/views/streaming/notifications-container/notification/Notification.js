import { Fragment, useState, useEffect} from 'react';
import {Button} from "@material-ui/core";

function Notification({ notification, index }) {

    const [open, setOpen] = useState(true);

    const onCancel = () => {
        notification.cancel();
        setOpen(false);
    }

    const onConfirm = () => {
        notification.confirm();
        setOpen(false);
    }

    if (!open) {
        return null;
    }

    return (
        <div key={index} className='animate__animated animate__fadeInDown'>
            <div className='notification-box'>
                <div className='notification-message'>{ notification.message }</div>        
                <div className='notification-buttons'>
                    <Button size='small' variant="contained" style={{marginRight: "1rem"}} onClick={onCancel}>{notification.cancelMessage}</Button>
                    <Button size='small' variant="contained" onClick={onConfirm} color="primary">{notification.confirmMessage}</Button>
                </div>
            </div>
            <style jsx>{`
                .notification-box {
                    background-color: white;
                    border-radius: 5px;
                    margin-bottom: 10px;
                    padding: 20px;
                    box-shadow: 0 0 5px grey;
                }
                .notification-message {
                    font-size: 0.9rem;
                    margin: 0 0 10px 0;
                }
                .notifications-buttons {
                    padding: 5px 0;
                }
            `}</style>
        </div>
    );
}

export default Notification;