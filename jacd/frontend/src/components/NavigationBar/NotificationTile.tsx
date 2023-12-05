import { useEffect, useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ApiHelper from '../ApiHelper';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { toast } from 'react-toastify';

interface NotificationsProps {
    request: any;
    index: any;
}

const NotificationTile = (props: NotificationsProps) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const { request } = props;
    const [userDetail, setUserDetail] = useState<any>(null)
    const getUserDetail = async (u_id: any) => {
        console.log(u_id)
        try {
            const response: any = await ApiHelper('GET', `/users/${u_id}`, token, null);
            setUserDetail(response);
        } catch (error: any) {
            toast.error(error)
        }
    }
    const [projectDetail, setProjectDetail] = useState<any>(null)
    const getProjectDetail = async (p_id: any) => {
        try {
            const response: any = await ApiHelper('GET', `/projects/${p_id}`, token, null);
            setProjectDetail(response);
        } catch (error: any) {
            toast.error(error)
        }
    }

    useEffect(() => {
        getUserDetail(request.sender_id)
        if (request.r_type === 'project') {
            getProjectDetail(request.p_id);
        }
    }, [])

    const notificationProjectInformation = () => {
        return (
            <Typography>
                {userDetail?.fname + ' ' + userDetail?.lname + ' wants to add you to project ' + projectDetail?.p_name}
            </Typography>
        )
    }

    const notificationFriendInformation = () => {
        return (
            <Typography>
                {userDetail?.fname + ' ' + userDetail?.lname + ' wants to add you as a friend'}
            </Typography>
        )
    }

    const handleAcceptProjectButton = async (p_id: number, r_id: number) => {
        try {
            await ApiHelper('POST', `/projects/${p_id}/${userId}`, token, null);
            await ApiHelper('DELETE', `/requests/remove/${r_id}`, token, null);
        } catch (error: any) {
            toast.error(error)
        }
    }

    const handleAcceptFriendButton = async (u_id: number, r_id: number) => {
        try {
            await ApiHelper('POST', `/friends/add/${u_id}`, token, null);
            await ApiHelper('DELETE', `/requests/remove/${r_id}`, token, null);
        } catch (error: any) {
            toast.error(error)
        }

    }

    const acceptProjectButton = (request: any) => {
        return (
            <IconButton onClick={() => handleAcceptProjectButton(request?.p_id, request.r_id)}>
                <CheckCircleIcon fontSize='small' color='success' />
            </IconButton>
        )
    }

    const acceptFriendButton = (request: any) => {
        return (
            <IconButton onClick={() => handleAcceptFriendButton(request?.r_type, request.r_id)}>
                <PersonAddIcon fontSize='small' color='success' />
            </IconButton>
        )
    }

    const handleRejectProjectButton = async (r_id: number) => {
        await ApiHelper('DELETE', `/requests/remove/${r_id}`, token, null);
    }

    const handleRejectFriendButton = async (r_id: number) => {
        await ApiHelper('DELETE', `/requests/remove/${r_id}`, token, null);
    }

    const rejectProjectButton = (request: any) => {
        return (
            <IconButton onClick={() => handleRejectProjectButton(request.r_id)}>
                <CancelIcon fontSize='small' color='error' />
            </IconButton>
        )
    }

    const rejectFriendButton = (request: any) => {
        return (
            <IconButton onClick={() => handleRejectFriendButton(request.r_id)}>
                <PersonRemoveIcon fontSize='small' color='error' />
            </IconButton>
        )
    }

    return (
        request.r_type === 'project'
            ?
                <Typography>
                    {notificationProjectInformation()}
                    {acceptProjectButton(request)}
                    {rejectProjectButton(request)}
                </Typography>

            :
                <Typography>
                    {notificationFriendInformation()}
                    {acceptFriendButton(request)}
                    {rejectFriendButton(request)}
                </Typography>
    )
}

export default NotificationTile;