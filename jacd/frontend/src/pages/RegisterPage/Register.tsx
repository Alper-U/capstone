import React from 'react';
import {
    Button,
    TextField,
    Avatar,
    CssBaseline,
    Link,
    Grid,
    Box,
    Typography,
    Container,
    Alert,
} from '@mui/material';
import DumbbellIcon from '@mui/icons-material/FitnessCenterOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ApiHelper from '../../components/ApiHelper';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface RegisterProps {
    setToken(arg0: string): void
}

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://github.com/unsw-cse-comp3900-9900-23T1/capstone-project-3900w18agamergirls">
                JACD
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const theme = createTheme();

const Register = (props: RegisterProps) => {
    const { setToken } = props;
    const [fname, setFirstName] = React.useState('');
    const [lname, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const registerBtn = async () => {
        if (!fname || !lname || !email || !password) {
            toast.error("Form Fields Empty!")
        } else if (confirmPassword !== password) {
            toast.error("Passwords Don't Match!")
        } else if (!password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])') || password.length < 8) {
            toast.error(
                <div>Password Must Include At Least:
                    <br /> - 1 Upper Character<br /> - 1 Lower Character<br /> - 1 Special Character
                    <br /> -  1 Number <br /> -  Minimum 8 Characters Total
                </div>)
        } else {
            try {
                const body = {
                    email,
                    password,
                    fname,
                    lname
                }
                const response: any = await ApiHelper('POST', '/auth/register', null, body)
                setToken(response.token);
                localStorage.setItem('token', response.token);
                localStorage.setItem('userId', response.u_id);
                // navigate('/')
                // navigate(0)
                localStorage.setItem('email', email);
            } catch (error: any) {
                toast.error(error);
            }
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ width: 50, height: 50, m: 1, bgcolor: 'secondary.main' }}>
                        <DumbbellIcon fontSize="large" />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign Up
                    </Typography>
                    <Box component="form" sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    onChange={(event) => setFirstName(event.target.value)}
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    onChange={(event) => setLastName(event.target.value)}
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                    fullWidth
                                    name="confirm password"
                                    label="Confirm Password"
                                    type="password"
                                    id="confirm-password"
                                    autoComplete="new-password"
                                />
                            </Grid>
                        </Grid>
                        <Button
                            onClick={() => registerBtn()}
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 5 }} />
            </Container>
        </ThemeProvider>
    );
}

export default Register;
