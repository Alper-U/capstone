import Button from '@mui/material/Button/Button';
import TextField from '@mui/material/TextField/TextField';
import React, { useEffect, useState } from 'react';
import Flex from '../../components/Flex/Flex';
import ApiHelper from '../../components/ApiHelper';
import Typography from '@mui/material/Typography/Typography';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Modal, Paper, Stack, styled } from '@mui/material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import TaskComponent from '../../components/TaskComponents/TaskComponent';
import BusyMeter from './BusyMeter';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column ',
    alignItems: 'center',
    gap: '10px'
};

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    backgroundColor: 'GhostWhite',
}));

interface ProfileProps {
    setToken(arg0: string | null): void
}

const Profile = (props: ProfileProps) => {
    const { setToken } = props;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const params = useParams();
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');

    const getUserDetails = async () => {
        const response: any = await ApiHelper('GET', `/users/${params.u_id}`, token, null);
        setFirstName(response.fname)
        setLastName(response.lname)
        setEmail(response.email)
    }

    useEffect(() => {
        if (!token) navigate('/login');
        const interval = setInterval(() => {
            getUserAssignedTasksWithDeadline();
            getUserAssignedTasksWithOutDeadline();
            getBusyMeter();
        }, 2000);
        getUserAssignedTasksWithDeadline();
        getUserAssignedTasksWithOutDeadline();
        getBusyMeter();
        getUserDetails();
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    const getUserAssignedTasksWithDeadline: any = async () => {
        try {
            const response: any = await ApiHelper('GET', `/tasks`, token, null);
            const assignedTasks = [...response.tasks]
                .filter((task: any) => {
                    return task.assignee_id == params.u_id && task.task_status !== 'Done'&& task.deadline !== 'Invalid Date';
                })
                .sort((a, b) => {
                    if (dayjs(a.deadline).isSame(dayjs(b.deadline))) return 0;
                    if (dayjs(a.deadline).isBefore(dayjs(b.deadline))) return -1;
                    else return 1;
                })
                setUserAssignedTasksWithDeadline(assignedTasks)
        } catch (error: any) {
            toast.error(error);
        }
    }

    const [userAssignedTasksWithDeadline, setUserAssignedTasksWithDeadline] = React.useState(getUserAssignedTasksWithDeadline);
    const getUserAssignedTasksWithOutDeadline: any = async () => {
        try {
            const response: any = await ApiHelper('GET', `/tasks`, token, null);
            const assignedTasks = [...response.tasks]
                .filter((task: any) => {
                    if (task.assignee_id == params.u_id && task.task_status !== 'Done' && task.deadline === 'Invalid Date') return true;
                    return false;
                })
            setUserAssignedTasksWithOutDeadline(assignedTasks)
        } catch (error: any) {
            toast.error(error);
        }
    }

    const [userAssignedTasksWithOutDeadline, setUserAssignedTasksWithOutDeadline] = React.useState(getUserAssignedTasksWithOutDeadline);

    const getBusyMeter = async () => {
        try {
            const response: any = await ApiHelper('GET', `/user/${params.u_id}/business`, token, null);
            setBusyMeter(response);
        } catch (error) {
            alert(error);
        }
    }
    const [busyMeter, setBusyMeter]: any = useState(0);

    return (
        <>
            <Flex>
                <Flex flexDirection='column' width='50vw' alignItems='center'>
                    <Flex padding='5vh 5vw 5vh 5vw'>
                        <Typography variant="h3" gutterBottom>
                            {firstName}'s Profile
                        </Typography>
                    </Flex>

                    <Flex gap='100px' padding='0vh 5vw 0vh 5vw'>
                        <Typography fontWeight={'bold'}>First Name: {firstName}</Typography>
                        <Typography fontWeight={'bold'}>Last Name: {lastName}</Typography>
                    </Flex>
                    <Flex padding='5vh 5vw 0vh 5vw'>
                        <Typography fontWeight={'bold'}>Email: {email}</Typography>
                    </Flex>
                    <Flex height='30vh'>
                        <BusyMeter busyMeter={busyMeter}></BusyMeter>
                    </Flex>
                </Flex>
                <Flex flexDirection='column' width='50vw' alignItems='center'>
                    <Flex padding='5vh 5vw 5vh 5vw' flexDirection='column'>
                        <Typography variant="h3" gutterBottom>
                            {firstName}'s Assigned Task List
                        </Typography>
                        <Stack spacing={2}>
                            {userAssignedTasksWithDeadline.length > 0 ? [...userAssignedTasksWithDeadline].map((task: any, index) => {
                                return (
                                    <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                        <TaskComponent inProject={false} title={"Edit Task"} index={index} task={task} setTasks={setUserAssignedTasksWithDeadline} getTasksInProject={getUserAssignedTasksWithDeadline} assigneeTask={true}></TaskComponent>
                                    </Item>
                                )
                            }) : <></>}
                            {userAssignedTasksWithOutDeadline.length > 0 ? [...userAssignedTasksWithOutDeadline].map((task: any, index) => {
                                return (
                                    <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                        <TaskComponent inProject={false} title={"Edit Task"} index={index} task={task} setTasks={setUserAssignedTasksWithOutDeadline} getTasksInProject={getUserAssignedTasksWithOutDeadline} assigneeTask={true}></TaskComponent>
                                    </Item>
                                )
                            }) : <></>}
                        </Stack>
                    </Flex>
                </Flex>
            </Flex>
        </>
    );
}


export default Profile