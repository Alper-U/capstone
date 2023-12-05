import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DumbbellIcon from '@mui/icons-material/FitnessCenterOutlined';
import { useNavigate } from 'react-router-dom';

interface NavigationBarProps {
    title: string;
}

const NavigationBar = (props: NavigationBarProps) => {
    const navigate = useNavigate();
    
    const theme = createTheme({
        palette: {
            primary: {
                main: '#923ADC',
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Box onClick={() => { navigate('/login') }} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <DumbbellIcon fontSize='large'></DumbbellIcon>
                            <Typography variant="h3" component="div" sx={{ fontFamily: 'fantasy', flexGrow: 1, margin: '0 0 0 15px' }}>
                                {props.title}
                            </Typography>
                        </Box>
                    </Toolbar>
                </AppBar>
            </Box>
        </ThemeProvider>
    )
}

export default NavigationBar;