import { Box, Button, InputLabel, MenuItem, Modal, Paper, Select, Stack, styled, TextField, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ApiHelper from '../../components/ApiHelper';
import Flex from '../../components/Flex/Flex';
import TaskComponent from '../../components/TaskComponents/TaskComponent';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { IconButton } from '@mui/material';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { DesktopDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import PersonIcon from '@mui/icons-material/Person';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { toast } from 'react-toastify';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column ',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '14px',
};

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    backgroundColor: 'GhostWhite',
}));

const Project = () => {
    const userId = localStorage.getItem('userId');
    const params = useParams();
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('email');
    const navigate = useNavigate();
    const getProject = async () => {
        try {
            const response: any = await ApiHelper('GET', '/projects/' + params.name, token, null);
            setProject(response);
        } catch (err: any) {
            toast.error(err);
        }
    }
    const [project, setProject] = React.useState<any>(getProject);
    const getTasksInProject = async () => {
        try {
            const response: any = await ApiHelper('GET', '/tasks/projects/' + params.name, token, null);
            setTasks(response.tasks);
        } catch (err: any) {
            toast.error(err);
        }
    }
    const [tasks, setTasks] = React.useState<any>(getTasksInProject);
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [status, setStatus] = React.useState('To Do');
    const [deadline, setDeadline] = React.useState<any>(null);
    const [openCreateTask, setOpenCreateTask] = React.useState(false);
    const [openAddUser, setOpenAddUser] = React.useState(false);
    const [email, setEmail] = React.useState('');

    const [isAdmin, setIsAdmin] = React.useState(false);
    const [assigneeEmail, setAssigneeEmail] = React.useState<string | null>(null);

    const getAllUsersInProject = async (): Promise<any> => {
        try {
            const response: any = await ApiHelper('GET', `/projects/${params.name}/users`, token, null);
            setAllUsersInProject(response.users);
        } catch (error: any) {
            toast.error(error);
        }
    }
    const checkUser = async () => {
        let exists = false;
        const responseExist: any = await ApiHelper('GET', `/projects/${params.name}/users`, token, null);
        [...responseExist.users].map((user: any) => {
            if (user.u_id == userId) {
                exists = true;
                if (user.admin == 1) setIsAdmin(true);
                else setIsAdmin(false);
            }
        })
        if (!exists) {
            navigate('/home');
        }
    }

    const [allUsersInProject, setAllUsersInProject] = React.useState<any>([]);
    const handleCreateTask = async (t_name: string, t_description: string, assignee_id: number | null, creator_id: number, task_status: string, t_deadline: string) => {
        try {
            const assignee: any = await ApiHelper('GET', `/user/${assigneeEmail ? assigneeEmail : userEmail}`, token, null);
            const deadlineDate = dayjs(deadline)
            const deadlineFormatted = deadlineDate.format('YYYY-MM-DD HH:mm:ss')
            const body = {
                t_name,
                t_description,
                assignee_id: assignee.u_id,
                creator_id,
                task_status,
                t_deadline: deadlineFormatted,
            }
            await ApiHelper('POST', `/tasks/create/${params.name}`, token, body);
            setTasks(getTasksInProject);
            setName('');
            setDescription('');
            setStatus('To Do');
            setDeadline(null);
        } catch (error: any) {
            toast.error(error);
        }
    }

    const handleAddUser = async (email: string) => {
        try {
            const user: any = await ApiHelper('GET', `/user/${email}`, token, null);
            const body = {
                p_id: params.name,
                r_type: 'project'
            }
            await ApiHelper('POST', `/requests/send/${user.u_id}`, token, body);
            setEmail('');
            getAllUsersInProject();
            toast.success("Invite Request Sent");
        } catch (error: any) {
            toast.error(error);
        }
    }

    const handleLeaveProject = async () => {
        try {
            await ApiHelper('PUT', `/projects/${params.name}/leave`, token, null);
            navigate('/home');
        } catch (error: any) {
            toast.error(error);
        }
    }

    const handleRemoveUser = async (email: string) => {
        try {
            const user: any = await ApiHelper('GET', `/user/${email}`, token, null);
            await ApiHelper('DELETE', `/projects/${params.name}/${user.u_id}`, token, null);
            getAllUsersInProject();
        } catch (error: any) {
            toast.error(error)
        }
    }

    const renderRemoveButton = (u_id: string, email: string) => {
        if (userId == u_id || !isAdmin) return;
        return (
            <IconButton title="Remove User" onClick={() => handleRemoveUser(email)}>
                <RemoveCircleOutlineIcon fontSize='small' color='error' />
            </IconButton>
        )
    }

    const handlePromoteUser = async (u_id: string) => {
        try {
            await ApiHelper('PUT', `/projects/${params.name}/${u_id}/promote`, token, null);
            toast.success('User Promoted')
        } catch (error: any) {
            toast.error(error)
        }
    }

    const renderPromoteButton = (u_id: string, isUserAdmin: number) => {
        if (userId == u_id || isAdmin == false || isUserAdmin == 1) return;
        return (
            <IconButton title="Promote User" onClick={async () => { await handlePromoteUser(u_id), await checkUser(), getAllUsersInProject() }}>
                <SupervisorAccountIcon fontSize='small' color='success' />
            </IconButton>
        );
    }

    const handleDemoteUser = async (u_id: string) => {
        try {
            await ApiHelper('PUT', `/projects/${params.name}/${u_id}/demote`, token, null);
            toast.success('User Demoted')
        } catch (error: any) {
            toast.error(error)
        }
    }

    const renderDemoteButton = (u_id: string, isUserAdmin: number) => {
        if (userId == u_id || isAdmin == false || isUserAdmin == 0) return;
        return (
            <IconButton title="Demote User" onClick={async () => { await handleDemoteUser(u_id), await checkUser(), getAllUsersInProject() }}>
                <SupervisorAccountIcon fontSize='small' color='error' />
            </IconButton>
        );
    }

    const handleMessageUser = (u_id: string) => {
        navigate(`/chat/${userId}/${u_id}`);
    }
    const renderMessageButton = (u_id: string) => {
        return (
            <IconButton onClick={() => { handleMessageUser(u_id) }} title="Message User">
                <ChatRoundedIcon fontSize='small' />
            </IconButton>
        );
    }

    const handleAddFriend = async (u_id: string) => {
        try {
            const body = {
                r_type: userId
            }
            await ApiHelper('POST', `/requests/send/${u_id}`, token, body);
            toast.success("Friend Request Sent");
        } catch (error: any) {
            toast.error(error)
        }
    }

    const renderAddFriendButton = (u_id: string) => {
        return (
            <IconButton onClick={async () => { await handleAddFriend(u_id) }} title="Add Friend">
                <PersonAddIcon fontSize='small' />
            </IconButton>
        );
    }
    const handleNavigateToProfile = (u_id: string) => {
        console.log(u_id)
        navigate(`/profile/${u_id}`);
    }

    useEffect(() => {
        if(!token) navigate('/login');
        const interval = setInterval(() => {
            checkUser();
            getAllUsersInProject();
        }, 2000);
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    return (
        <Flex flexDirection='column' alignItems='center'>
            {project && (
                <Box>
                    <h1>{project.p_name}</h1>
                    <Box sx={{ marginBottom: '30px' }}>{project.p_description}</Box>
                    <Flex flexDirection='row' gap='20px' alignItems='flex-start'>
                        <Button variant='contained' onClick={(() => { setAssigneeEmail(userEmail), setOpenCreateTask(true), getAllUsersInProject() })}>Create Task</Button>
                        <Button variant='contained' onClick={(async () => { setOpenAddUser(true), await checkUser(), getAllUsersInProject() })}>Users</Button>
                        <Box marginLeft={'auto'}>
                            <Button variant='contained' color='error' onClick={(() => handleLeaveProject())}>Leave Project</Button>
                        </Box>
                    </Flex>
                    <Flex flexDirection='column' alignItems='center'>
                        <Flex flexDirection='row' gap='10vw'>
                            <Flex flexDirection='column' alignItems='center' width='25vw'>
                                <h2>To Do</h2>
                                <Box sx={{ width: '100%', overflow: 'auto', maxHeight: '80vh', padding: '10px' }}>
                                    <Stack spacing={2}>
                                        {(tasks.length > 0
                                            ? [...tasks]
                                                .map((task: any, index) => {
                                                    if (task.task_status === 'To Do') {
                                                        return (
                                                            <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                                                <TaskComponent inProject={true} task={task} index={index} title={'Edit Task'} setTasks={setTasks} getTasksInProject={getTasksInProject} />
                                                            </Item>
                                                        )
                                                    }
                                                })
                                            : <></>)}
                                    </Stack>
                                </Box>
                            </Flex>
                            <Flex flexDirection='column' alignItems='center' width='25vw'>
                                <h2>In Progress</h2>
                                <Box sx={{ width: '100%', overflow: 'auto', maxHeight: '80vh', padding: '10px' }}>
                                    <Stack spacing={2}>
                                        {(tasks.length > 0
                                            ? [...tasks]
                                                .map((task: any, index) => {
                                                    if (task.task_status === 'In Progress') {
                                                        return (
                                                            <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                                                <TaskComponent inProject={true} task={task} index={index} title={'Edit Task'} setTasks={setTasks} getTasksInProject={getTasksInProject} />
                                                            </Item>
                                                        )
                                                    }
                                                })
                                            : <></>)}
                                    </Stack>
                                </Box>
                            </Flex>
                            <Flex flexDirection='column' alignItems='center' width='25vw'>
                                <h2>Done</h2>
                                <Box sx={{ width: '100%', overflow: 'auto', maxHeight: '80vh', padding: '10px' }}>
                                    <Stack spacing={2}>
                                        {(tasks.length > 0
                                            ? [...tasks]
                                                .map((task: any, index) => {
                                                    if (task.task_status === 'Done') {
                                                        return (
                                                            <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                                                <TaskComponent inProject={true} task={task} index={index} title={'Edit Task'} setTasks={setTasks} getTasksInProject={getTasksInProject} />
                                                            </Item>
                                                        )
                                                    }
                                                })
                                            : <div></div>)}
                                    </Stack>
                                </Box>
                            </Flex>
                        </Flex>
                        <Modal
                            open={openCreateTask}
                            onClose={() => setOpenCreateTask(false)}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={style}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Create Task
                                </Typography>
                                <TextField
                                    sx={{ marginTop: '20px' }}
                                    onChange={(event) => setName(event.target.value)}
                                    label="Task Name"
                                    value={name}
                                />
                                <TextField
                                    sx={{ marginTop: '20px' }}
                                    onChange={(event) => setDescription(event.target.value)}
                                    label="Description"
                                    value={description}
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <InputLabel> Assignee </InputLabel>
                                    <Select
                                        value={assigneeEmail}
                                        onChange={(event) => { setAssigneeEmail(event.target.value) }}
                                    >
                                        {[...allUsersInProject].map((user: any, index) => {
                                            return (
                                                <MenuItem key={index} value={user.u_email}>{user.u_email}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <InputLabel> Status </InputLabel>
                                    <Select
                                        value={status}
                                        onChange={(event) => setStatus(event.target.value.toString())}
                                    >
                                        <MenuItem value="To Do">To Do</MenuItem>
                                        <MenuItem value="In Progress">In Progress</MenuItem>
                                        <MenuItem value="Done">Done</MenuItem>
                                    </Select>
                                </Box>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DesktopDateTimePicker
                                        label="Deadline"
                                        value={deadline}
                                        onChange={(newVal) => setDeadline(newVal)}
                                    />
                                </LocalizationProvider>
                                <Box sx={{ display: 'flex' }}>
                                    <Button onClick={() => { handleCreateTask(name, description, null, userId ? parseInt(userId) : -1, status, deadline), setOpenCreateTask(false) }}>Save</Button>
                                </Box>
                            </Box>
                        </Modal>
                        <Modal
                            open={openAddUser}
                            onClose={() => { setOpenAddUser(false), setEmail(''); }}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={style}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Add User
                                </Typography>
                                <TextField
                                    sx={{ width: 300 }}
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    label='Email'
                                />
                                <Box sx={{ display: 'flex' }}>
                                    <Button onClick={() => { handleAddUser(email) }}>Add User</Button>
                                </Box>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    Project members
                                </Typography>
                                <Flex flexDirection='column'>
                                    {[...allUsersInProject].map((user: any, index) => {
                                        return (
                                            <Flex key={index}>
                                                <Box>
                                                    <Typography fontWeight='bold' display='inline' title={user.u_email}> {user.u_fname + ' ' + user.u_lname} </Typography>
                                                    {user.u_id != userId ? <IconButton title="View Profile" onClick={() => handleNavigateToProfile(user.u_id)}>
                                                        <PersonIcon fontSize='small' />
                                                    </IconButton> : <></>}
                                                    {renderRemoveButton(user.u_id, user.u_email)}
                                                    {renderPromoteButton(user.u_id, user.admin)}
                                                    {renderDemoteButton(user.u_id, user.admin)}
                                                    {user.u_id != userId && renderMessageButton(user.u_id)}
                                                    {user.u_id != userId && renderAddFriendButton(user.u_id)}
                                                </Box>
                                            </Flex>
                                        );
                                    })}
                                </Flex>
                            </Box>
                        </Modal>
                    </Flex>
                </Box>
            )}
        </Flex>
    );
}

export default Project;