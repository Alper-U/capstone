import Button from '@mui/material/Button/Button';
import TextField from '@mui/material/TextField/TextField';
import React, { useEffect, useState } from 'react';
import Flex from '../../components/Flex/Flex';
import ApiHelper from '../../components/ApiHelper';
import Typography from '@mui/material/Typography/Typography';
import { useNavigate } from 'react-router-dom';
import { Box, Modal, Paper, Stack, styled } from '@mui/material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import TaskComponent from '../../components/TaskComponents/TaskComponent';
import { TaskAlt } from '@mui/icons-material';
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
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const navigate = useNavigate();

    const getUserDetails = async () => {
        const response : any = await ApiHelper('GET', `/users/${userId}`, token, null);
        setFirstName(response.fname)
        setLastName(response.lname)
        setEmail(response.email)
    }

    const getBusyMeter = async () => {
        try {
            const response: any = await ApiHelper('GET', `/user/${userId}/business`, token, null);
            setBusyMeter(response);
        } catch (error: any) {
            toast.error(error);
        }
    }
    const [busyMeter, setBusyMeter]: any = useState(0);

    useEffect(() => {
        if(!token) navigate('/login');
        getUserDetails();
        getUserAssignedTasksWithDeadline();
        getUserAssignedTasksWithOutDeadline();
        getBusyMeter();
    }, [])

    useEffect(() => {
        if(!token) navigate('/login');
        const interval = setInterval(() => {
            getUserAssignedTasksWithDeadline();
            getUserAssignedTasksWithOutDeadline();
            getBusyMeter();
        }, 2000);
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    const handleUpdateDetails = async () => {
        const token = localStorage.getItem('token')
        if (userId !== null) {
            try {
                const body = {
                    fname: firstName,
                    lname: lastName,
                    email: email,
                }
                await ApiHelper('PUT', `/users/${userId}`, token, body);
                toast.success('Your details have been updated.');
            } catch (error: any) {
                toast.error(error);
            }
        }
    }

    const handleDelete = () => {
        if (userId !== null) {
            try {
                ApiHelper('DELETE', `/users/${userId}`, token, null);
                localStorage.clear();
                setToken(null);
                navigate('/login');
            } catch (error: any) {
                toast.error(error);
                localStorage.clear();
                setToken(null);
                navigate('/login');
            }
        }
    }

    const getUserAssignedTasksWithDeadline : any = async () =>  {
        try {
            const response: any = await ApiHelper('GET', `/tasks`, token, null);
            const assignedTasks = [...response.tasks]
            .filter((task : any) => {
                if(task.assignee_id == userId && task.task_status !== 'Done' && task.deadline !== 'Invalid Date') return true;
                return false;
            })
            .sort((a, b) => {
                if(dayjs(a.deadline).isSame(dayjs(b.deadline))) return 0;
                if(dayjs(a.deadline).isBefore(dayjs(b.deadline))) return -1;
                else return 1;
            })
            setUserAssignedTasksWithDeadline(assignedTasks)
        } catch (error: any) {
            toast.error(error);
        }
    }

    const [userAssignedTasksWithDeadline, setUserAssignedTasksWithDeadline] = React.useState(getUserAssignedTasksWithDeadline);

    const getUserAssignedTasksWithOutDeadline : any = async () =>  {
        try {
            const response: any = await ApiHelper('GET', `/tasks`, token, null);
            const assignedTasks = [...response.tasks]
            .filter((task : any) => {
                if(task.assignee_id == userId && task.task_status !== 'Done' && task.deadline === 'Invalid Date') return true;
                return false;
            })
            setUserAssignedTasksWithOutDeadline(assignedTasks)
        } catch (error: any) {
            toast.error(error);
        }
    }

    const [userAssignedTasksWithOutDeadline, setUserAssignedTasksWithOutDeadline] = React.useState(getUserAssignedTasksWithOutDeadline);
    return (
      <>
        <Flex>
            <Flex flexDirection='column' width='50vw' alignItems='center'>
                <Flex padding='5vh 5vw 5vh 5vw'>
                    <Typography variant="h3" gutterBottom>
                        My Profile
                    </Typography>
                </Flex>
                
                <Flex gap='100px' padding='0vh 5vw 0vh 5vw'>
                    <TextField id="firstNameField" label="First Name" variant="outlined" value={firstName} onChange={(event) => {setFirstName(event.target.value)}} sx={{width: 200}}/>
                    <TextField id="lastNameField" label="Last Name" variant="outlined" value={lastName} onChange={(event) => {setLastName(event.target.value)}} sx={{width: 200}}/>
                </Flex>
                <Flex padding='5vh 5vw 0vh 5vw'>
                    <TextField id="emailField" label="Email" variant="outlined" value={email} onChange={(event) => {setEmail(event.target.value)}} sx={{width: 500}}/>
                </Flex>
                <Flex padding='5vh 5vw 5vh 5vw'>
                    <Button onClick={() => handleUpdateDetails()} variant='contained'>Update Details</Button>
                </Flex>
                <Flex height='30vh'>
                    <BusyMeter busyMeter={busyMeter}></BusyMeter>
                </Flex>
                <Flex padding='5vh 5vw 5vh 5vw' alignSelf='flex-end'>
                    <Button onClick={() => handleOpen()} color='error' variant='contained'>Delete Account</Button>
                </Flex>
            </Flex>
            <Flex flexDirection='column' width='50vw' alignItems='center'>
                <Flex padding='5vh 5vw 5vh 5vw' flexDirection='column'>
                    <Typography variant="h3" gutterBottom>
                        My Assigned Task List
                    </Typography>
                    <Stack spacing={2}>
                        {userAssignedTasksWithDeadline.length > 0 ? [...userAssignedTasksWithDeadline].map((task : any, index) => {
                            return(
                                <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                    <TaskComponent inProject={false} title={"Edit Task"} index={index} task={task} setTasks={setUserAssignedTasksWithDeadline} getTasksInProject={getUserAssignedTasksWithDeadline} assigneeTask={true}></TaskComponent>
                                </Item>
                            )
                        }) : <></>}
                        {userAssignedTasksWithOutDeadline.length > 0 ? [...userAssignedTasksWithOutDeadline].map((task : any, index) => {
                            return(
                                <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                    <TaskComponent inProject={false} title={"Edit Task"} index={index} task={task} setTasks={setUserAssignedTasksWithOutDeadline} getTasksInProject={getUserAssignedTasksWithOutDeadline} assigneeTask={true}></TaskComponent>
                                </Item>
                            )
                        }) : <></>}
                    </Stack>
                </Flex>
            </Flex>
        </Flex>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h3">
                    Are you sure you want to delete your account?
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    <Button color='error' onClick={() => { handleDelete(), handleClose() }}>Delete Account</Button>
                </Box>
                <Box sx={{ display: 'flex' }}>
                    <Button onClick={() => { handleClose() }}>Cancel</Button>
                </Box>
            </Box>
        </Modal>
      </>
    );
  }
  
  
  export default Profile