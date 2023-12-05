import { Box, Grid } from '@mui/material';
import React from 'react';
import ApiHelper from '../../../components/ApiHelper';
import ProjectComponent from './ProjectComponent';
import CreateProjectModal from './CreateProjectModal';
import { toast } from 'react-toastify';

const Home = () => {
    const [projects, setProjects] = React.useState([]);

    const getAllProjects = async () => {
        try {
            const token = localStorage.getItem('token')
            const response: any = await ApiHelper('GET', '/projects', token, null)
            setProjects(response.projects)
        } catch (err: any) {
            toast.error(err)
        }
    }

    React.useEffect(() => {
        getAllProjects()
    }, []);

    React.useEffect(() => {
        const interval = setInterval(() => {
            getAllProjects();
        }, 2000);
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    return (
        <Box sx={{
            overflow: 'auto',
            maxHeight: '25vh',
            borderColor: 'secondary.main',
            padding: '10px',
            width: '60vw'
        }}>
            <Grid container spacing={3} direction="row" justifyContent="flex-start" >
                <CreateProjectModal></CreateProjectModal>
                {(projects.length > 0
                    ? [...projects]
                        .map((project: any, index) => {
                            return (
                                <Grid key={index} item md={3}>
                                    <ProjectComponent id={project.p_id} name={project.p_name} description={project.p_description}></ProjectComponent>
                                </Grid>
                            )
                        })
                    : <div></div>)}
            </Grid>
        </Box >
    );
}

export default Home