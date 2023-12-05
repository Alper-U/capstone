import React from 'react';
import DumbbellIcon from '@mui/icons-material/FitnessCenterOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Button,
    TextField,
    Avatar,
    CssBaseline,
    FormControlLabel,
    Checkbox,
    Link,
    Grid,
    Box,
    Typography,
    Container,
} from '@mui/material';
import ApiHelper from '../../components/ApiHelper';
import { toast } from 'react-toastify';

interface LoginProps {
    setToken(arg0: string): void
}

function Copyright() {
    return (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8, mb: 4 }}>
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

const Login = (props: LoginProps) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [rememberMe, setRememberMe] = React.useState(false);

    const loginBtn = async (email: string, password: string) => {
        try {
            const body = {
                email,
                password,
                rememberMe
            }
            const response: any = await ApiHelper('POST', '/auth/login', null, body)
            props.setToken(response.token)
            localStorage.setItem('token', response.token);
            localStorage.setItem('email', email);
            localStorage.setItem('userId', response.u_id);
        } catch (error: any) {
            toast.error(error);
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
                        Log In
                    </Typography>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            onChange={(event) => setEmail(event.target.value)}
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            onChange={(event) => setPassword(event.target.value)}
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                            onChange={() => setRememberMe(!rememberMe)}
                        />
                        <Button
                            onClick={() => loginBtn(email, password)}
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Log In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="/register" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/forgotPassword" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright />
            </Container>
        </ThemeProvider>
    );
}

export default Login