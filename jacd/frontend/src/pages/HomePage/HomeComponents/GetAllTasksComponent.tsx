import { Box, Paper, Stack, styled } from '@mui/material';
import React from 'react';
import ApiHelper from '../../../components/ApiHelper';
import TaskComponent from '../../../components/TaskComponents/TaskComponent';
import Flex from '../../../components/Flex/Flex';
import { toast } from 'react-toastify';

const Item = styled(Paper)(({ theme }) => ({
    // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    backgroundColor: 'GhostWhite',
}));


const GetAllTasksComponent = () => {
    const [tasks, setTasks] = React.useState([]);

    const getAllTasks = async () => {
        try {
            const token = localStorage.getItem('token')
            const response: any = await ApiHelper('GET', '/tasks', token, null)
            setTasks(response.tasks)
        } catch (err: any) {
            toast.error(err)
        }
    }

    React.useEffect(() => {
        getAllTasks()
    }, []);

    React.useEffect(() => {
        const interval = setInterval(() => {
            getAllTasks();
        }, 2000);
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])
    
    return (
        <Box sx={{
            overflow: 'auto',
            width: '60vw',
            padding: '10px'
        }}>
            <Stack spacing={2}>
                {(tasks.length > 0
                    ? [...tasks]
                        .map((task: any, index) => {
                            return (
                                <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                    <TaskComponent inProject={false} title={"Edit Task"} index={index} task={task} setTasks={setTasks} getTasksInProject={getAllTasks}></TaskComponent>
                                </Item>
                            )
                        }) : <Flex justifyContent='center'>NO TASKS TO DISPLAY</Flex>)}
            </Stack>
        </Box >
    );
}

export default GetAllTasksComponent;