import React from 'react';
import GetAllProjectsComponent from './HomeComponents/GetAllProjectsComponent';
import GetAllTasksComponent from './HomeComponents/GetAllTasksComponent';
import GetSearchedTasksComponent from './HomeComponents/GetSearchedTasksComponent';
import Flex from '../../components/Flex/Flex';
import ApiHelper from '../../components/ApiHelper';
import { Box, Button, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface HomeProps {
    search: string | null;
    searchId: string | null;
    searchDescription: string | null;
    searchDeadlineAfter: any;
    searchDeadlineBefore: any;
}

const Home = (props: HomeProps) => {
    const [allTasks, setAllTasks] = React.useState([]);
    const token = localStorage.getItem('token');
    const [viewToken, setViewToken] = React.useState(false);
    const navigate = useNavigate();

    const getAllTasks = async () => {
        try {
            if(!token) navigate('/login');
            const response: any = await ApiHelper('GET', '/tasks', token, null);
            setAllTasks(response.tasks)
        } catch (err: any) {
            toast.error(err)
        }
    }

    React.useEffect(() => {
        getAllTasks()
        if(!token) navigate('/login');
    }, []);

    return (
        <div style={{
            margin: '5vh 5vw 0 5vw',
        }}>
            <Flex>
                <Flex flexDirection='column'>
                    <h1>Projects</h1>
                    <GetAllProjectsComponent></GetAllProjectsComponent>
                    <h1>Tasks</h1>
                    <Flex height='35vh'>
                        {(props.search || props.searchId || props.searchDescription || props.searchDeadlineAfter || props.searchDeadlineBefore) ?
                            <GetSearchedTasksComponent
                                allTasks={allTasks}
                                search={props.search}
                                searchId={props.searchId}
                                searchDescription={props.searchDescription}
                                searchDeadlineAfter={props.searchDeadlineAfter}
                                searchDeadlineBefore={props.searchDeadlineBefore}
                            ></GetSearchedTasksComponent>
                            : <GetAllTasksComponent></GetAllTasksComponent>}
                    </Flex>
                </Flex>
                <Box sx={{ display: 'flex', flexDirection: 'column', margin: '20px 0 0 20px' }}>
                    <Typography variant='h4'>Get The Discord Bot!</Typography>
                    <Typography variant='body1'>
                        JACD bot will make creating projects and tasks so much easier.<br></br>
                        Simply click on the button below and add JACD to you Discord Server.
                    </Typography>
                    <Box sx={{ marginTop: '10px', alignSelf: 'center' }}>
                        <Link to="https://discord.com/api/oauth2/authorize?client_id=1089544016481234984&permissions=0&scope=bot%20applications.commands" >
                            <Button onClick={() => ('')} color='secondary' variant='contained'>ADD BOT</Button>
                        </Link>
                    </Box>
                    <Box sx={{ marginTop: '10px', alignSelf: 'center', display: 'flex', flexDirection: 'column' }}>
                        <Button sx={{ alignSelf: 'center' }} onClick={() => setViewToken(!viewToken)} color='primary' variant='contained'>Display Token</Button>
                        {(viewToken &&
                            <Box sx={{ marginTop: '10px', width: '500px', overflowWrap: 'break-word' }}>
                                <Typography variant='body1'>
                                    This token will be used with your discord bot commands:
                                </Typography>
                                <Typography variant='caption'>
                                    {token}
                                </Typography>
                            </Box>)}
                    </Box>
                </Box>
            </Flex>
        </div >
    );
}

export default Home