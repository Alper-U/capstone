import { Box, Paper, Stack, styled } from '@mui/material';
import React from 'react';
import TaskComponent from '../../../components/TaskComponents/TaskComponent';
import dayjs from 'dayjs';

const Item = styled(Paper)(({ theme }) => ({
    // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    color: theme.palette.text.secondary,
    backgroundColor: 'GhostWhite',
}));

interface GetSearchedTasksComponentProps {
    search: any;
    searchId: any;
    searchDescription: any;
    searchDeadlineAfter: any;
    searchDeadlineBefore: any;
    allTasks: any;
}

const GetSearchedTasksComponent = (props: GetSearchedTasksComponentProps) => {
    const [tasks, setTasks] = React.useState([]);

    const filterTasks = () => {
        let filteredTasks = props.allTasks;
        
        if (props.search) {
            filteredTasks = filteredTasks.filter((task: any) => {
                const regex = new RegExp(props.search, 'i');
                return task.t_name.match(regex);
            })
        }

        if (props.searchId) {
            filteredTasks = filteredTasks.filter((task: any) => {
                return task.t_id == props.searchId;
            })
        }
        if (props.searchDescription) {
            filteredTasks = filteredTasks.filter((task: any) => {
                const regex = new RegExp(props.searchDescription, 'i');
                return task.t_description.match(regex);
            })
        }
        if (props.searchDeadlineAfter) {
            filteredTasks = filteredTasks.filter((task: any) => {
                return props.searchDeadlineAfter.isBefore(task.deadline);
            })
        }
        
        if (props.searchDeadlineBefore) {
            filteredTasks = filteredTasks.filter((task: any) => {
                return props.searchDeadlineBefore.isAfter(task.deadline);
            })
        }

        setTasks(filteredTasks)
    }
    
    
    React.useEffect(() => {
        filterTasks()
    }, [props.search, props.searchId, props.searchDescription, props.searchDeadlineAfter, props.searchDeadlineBefore]);

    return (
        <Box sx={{
            overflow: 'auto',
            width: '60vw',
            maxHeight: '25vh',
            padding: '10px'
        }}>
            <Stack spacing={2}>
                {(tasks.length > 0
                    ? [...tasks]
                        .map((task: any, index) => {
                            return (
                                <Item key={index} elevation={2} sx={{ ':hover': { boxShadow: 5 } }}>
                                    <TaskComponent inProject={false} title={"Edit Task"} index={index} task={task} setTasks={setTasks} getTasksInProject={filterTasks}></TaskComponent>
                                </Item>
                            )
                        }) : <div>Search Returned Nothing!</div>)}
            </Stack>
        </Box >
    );
}

export default GetSearchedTasksComponent;