import { Box, Button, createTheme, Modal, TextField, Typography, Grid } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ApiHelper from '../../../components/ApiHelper';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
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
    borderRadius: '14px',

};
const CreateProjectModal = () => {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const navigate = useNavigate()
    const [projectCreated, setProjectCreated] = React.useState(false);

    const handleSave = async () => {
        try {
            console.log("SAVE BUTTON")
            const token = localStorage.getItem('token')
            const userId = localStorage.getItem('userId')
            const body = {
                p_name: name,
                u_id: userId,
                p_description: description,
            }
            const response: any = await ApiHelper('POST', '/projects/create', token, body)
            setProjectCreated(true)
            navigate(0);
        } catch (err: any) {
            toast.error(err)
        }
    }

    return (
        <>
            <Grid item md={3}>
                <Box
                    sx={{
                        height: '140px',
                        overflow: 'hidden',
                        borderRadius: '14px',
                        textAlign: 'center',
                        boxShadow: 1,
                        bgcolor: 'GhostWhite',
                        cursor: 'pointer',
                        '&:hover': {
                            boxShadow: 3,
                            '*': {
                                color: 'black'
                            }
                        },
                    }}
                    onClick={() => { handleOpen() }}

                >
                    <Typography sx={{ color: 'grey', fontWeight: 'bold', margin: '5px', fontSize: '1.5em', }}>Create New Project</Typography>
                    <AddCircleOutlineIcon fontSize='large' color='disabled' sx={{ '&:hover': { color: 'action' } }}></AddCircleOutlineIcon>
                </Box >
            </Grid>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Create Project
                    </Typography>
                    <TextField
                        sx={{ marginTop: '20px', width: '300px' }}
                        onChange={(event) => setName(event.target.value)}
                        label="Project Name"
                    />
                    <TextField
                        sx={{ marginTop: '20px', width: '300px' }}
                        onChange={(event) => setDescription(event.target.value)}
                        label="Description"
                        multiline
                        rows={4}
                    />
                    <Button sx={{ width: '5vw', marginTop: '10px' }} onClick={() => { handleSave(), handleClose() }}>Create</Button>
                </Box>

            </Modal>
        </>
    );
}


export default CreateProjectModal


