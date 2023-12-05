import { Box, Button, InputLabel, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import React, { Dispatch } from 'react';
import ApiHelper from '../ApiHelper';
import { DesktopDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
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
interface TaskComponentProps {
    task: any;
    index: number;
    title: string;
    inProject: boolean;
    setTasks: Dispatch<any>;
    getTasksInProject: Dispatch<any>;
    assigneeTask?: boolean;
}

const TaskComponent = (props: TaskComponentProps) => {
    const { setTasks, getTasksInProject } = props;
    const [name, setName] = React.useState(props.task.name);
    const [description, setDescription] = React.useState("");
    const [status, setStatus] = React.useState<string>(props.task.task_status);
    const [assigneeEmail, setAssigneeEmail] = React.useState("");
    const [users, setUsers] = React.useState([]);
    const [creator, setCreator] = React.useState("");
    const [deadline, setDeadline] = React.useState<any>(null);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const token = localStorage.getItem('token')

    const handleTaskClick = async (taskId: number) => {
        try {
            const response: any = await ApiHelper('GET', '/tasks/' + taskId, token, null);
            const users: any = await ApiHelper('GET', '/projects/' + response.p_id + '/users', token, null);
            setUsers(users.users)
            if (response.assignee_id !== 'null' && response.assignee_id !== null) {
                const assignee: any = await ApiHelper('GET', '/users/' + response.assignee_id, token, null);
                setAssigneeEmail(assignee.email)
            }
            const creator_response: any = await ApiHelper('GET', '/users/' + response.creator_id, token, null);
            setCreator(`${creator_response.fname} ${creator_response.lname}`)
            setName(response.t_name)
            setDescription(response.t_description)
            setStatus(response.task_status)
            if (response.deadline !== "Invalid Date") {
                setDeadline(dayjs(response.deadline))
            }
        } catch (err: any) {
            toast.error(err)
        }
    }
    const handleStatusChange = (val: string) => {
        setStatus(val)
    }

    const handleSave = async (taskId: number) => {
        try {
            let a_id = null;
            if (assigneeEmail) {
                const assignee: any = await ApiHelper('GET', `/user/${assigneeEmail}`, token, null);
                a_id = assignee.u_id;
            }
            const deadlineDate = dayjs(deadline)
            const deadlineFormatted = deadlineDate.format('YYYY-MM-DD HH:mm:ss')
            const body = {
                t_name: name,
                t_description: description,
                assignee_id: assigneeEmail ? a_id : null,
                task_status: status,
                t_deadline: deadlineFormatted
            }
            await ApiHelper('PUT', '/tasks/' + taskId, token, body);
            setTasks(getTasksInProject);
        } catch (err: any) {
            toast.error(err)
        }
    }

    const deleteTask = async (taskId: number) => {
        try {
            await ApiHelper('DELETE', '/tasks/' + taskId, token, null);
            setTasks(getTasksInProject);
        } catch (err: any) {
            toast.error(err)
        }
    }
    
    const [taskCreator, setTaskCreator] = React.useState("");
    const setCreatorName = async () => {
        try {
            const creator_response: any = await ApiHelper('GET', '/users/' + props.task.creator_id, token, null);
            setTaskCreator(`${creator_response.fname} ${creator_response.lname}`)
        } catch (err: any) {
            toast.error(err)
        }
    }
    
    React.useEffect(() => {
        setCreatorName()
    }, [])

    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                cursor: 'pointer',
                height: '25px',
                alignItems: 'center'
            }}
                onClick={() => { handleTaskClick(props.task.t_id), handleOpen() }}
            >
                <Box sx={{ minWidth: '40px' }}>ID:{props.task.t_id || ''} </Box>
                <Box sx={{ width: props.inProject ? '150px' : '250px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{props.task.t_name || ''} </Box>
                {!props.inProject && !props.assigneeTask && (<Box sx={{ width: '150px' }}>Creator: {taskCreator || ''} </Box>)}
                {props.task.deadline === 'Invalid Date' ? (<Box sx={{ width: '150px' }}>Deadline: N/A</Box>) : (<Box sx={{ width: '150px' }}>Deadline: {dayjs(props.task.deadline).format('DD/MM/YYYY')}</Box>)}
                <Box sx={{ minWidth: '80px' }}>{props.task.task_status || ''} </Box>
            </Box>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {props.title}
                    </Typography>
                    <Typography id="modal-modal-title" variant="body1">
                        Creator: {creator}
                    </Typography>
                    <TextField
                        sx={{ marginTop: '20px', width: '300px' }}
                        onChange={(event) => setName(event.target.value)}
                        label="Task Name"
                        value={name || ''}
                    />
                    <TextField
                        sx={{ marginTop: '20px', width: '300px' }}
                        onChange={(event) => setDescription(event.target.value)}
                        label="Description"
                        value={description}
                        multiline
                        rows={4}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <InputLabel> Assignee </InputLabel>
                        <Select
                            value={assigneeEmail}
                            onChange={(event) => setAssigneeEmail(event.target.value)}
                        >
                            {[...users].map((user: any, index) => {
                                return (
                                    <MenuItem key={index} value={user.u_email}>{user.u_email}</MenuItem>
                                );
                            })}
                        </Select>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <InputLabel> Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(event) => handleStatusChange(event.target.value)}
                        >
                            <MenuItem value="To Do">To Do</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Done">Done</MenuItem>
                            <MenuItem value="Blocked">Blocked</MenuItem>
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
                        <Button onClick={() => { handleSave(props.task.t_id), handleClose() }}>Save</Button>
                        <Button color="error" onClick={() => { deleteTask(props.task.t_id), handleClose() }}>Delete</Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}


export default TaskComponent
