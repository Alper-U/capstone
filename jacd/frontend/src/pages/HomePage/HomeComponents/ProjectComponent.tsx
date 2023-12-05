import { Box } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProjectProps {
    id: number;
    name: string;
    description: string;
}

const ProjectComponent = (props: ProjectProps) => {
    const navigate = useNavigate();

    const handleProjectClick = () => {
        navigate('/project/' + props.id)
    }

    return (
        <Box
            sx={{
                height: '140px',
                overflow: 'hidden',
                borderRadius: '14px',
                textAlign: 'center',
                boxShadow: 2,
                bgcolor: 'GhostWhite',
                cursor: 'pointer',
                '&:hover': { boxShadow: 5 }
            }}
            onClick={handleProjectClick}
        >
            <Box sx={{ fontWeight: 'bold', margin: '5px', textDecoration: 'underline', fontSize: '1.5em' }}>{props.name}</Box>
            <div>{props.description}</div>
        </Box >
    );
}

export default ProjectComponent;