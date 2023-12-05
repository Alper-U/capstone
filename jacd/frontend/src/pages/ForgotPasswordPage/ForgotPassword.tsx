import { Avatar, Container, createTheme, CssBaseline, Link, ThemeProvider, Typography } from "@mui/material";
import React, { useState } from "react";
import DumbbellIcon from '@mui/icons-material/FitnessCenterOutlined';
import ApiHelper from "../../components/ApiHelper";
import Flex from "../../components/Flex/Flex";
import NewPasswordForm from "./ForgotPasswordComponents/NewPasswordForm";
import SendCodeForm from "./ForgotPasswordComponents/SendCodeForm";
import SubmitCodeForm from "./ForgotPasswordComponents/SubmitCodeForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const theme = createTheme();

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

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length: number) {
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}



const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [code, setCode] = useState(generateString(10));
    const [givenCode, setGivenCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [codeSubmit, setCodeSubmit] = useState('');
    const navigate = useNavigate();
    const onClickSendHandle = (code: string) => {
        const data = {
            service_id: 'service_2mjga2e',
            template_id: 'template_2sl99gp',
            user_id: 'J9Dk8EThGNl2UUqak',
            template_params: {
                'from_name': 'JACD',
                'to_name': '',
                'message': code,
                'email': email
            }
        };
        try {

            ApiHelper('POST', 'https://api.emailjs.com/api/v1.0/email/send', null, data, true);
            toast.success('Your code has been sent to your email.');
        } catch (err: any) {
            toast.error(err);
        }
        return;
    }
    const onClickResetPasswordHandle = async (newPassword: string) => {
        if (!newPassword.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])') || newPassword.length < 8) {
            toast.error(
                <div>Password Must Include At Least:
                    <br /> - 1 Upper Character<br /> - 1 Lower Character<br /> - 1 Special Character
                    <br /> -  1 Number <br /> -  Minimum 8 Characters Total
                </div>)
        }
        else {
            const data = {
                email: `${email}`,
                password: `${newPassword}`
            }
            try {
                ApiHelper('PUT', `/auth/resetpassword`, null, data);
                toast.success('Your password has been reset.');
            } catch (error: any) {
                toast.error(error);
            }
            navigate('/login');
        }

    }

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Flex flexDirection='column' alignItems='center' padding="10vh 0 0 0" gap="3vh">
                    <>
                        <Avatar sx={{ width: 50, height: 50, m: 1, bgcolor: 'secondary.main' }}>
                            <DumbbellIcon fontSize="large" />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Forgot Password
                        </Typography>
                        {
                            emailSent !== true
                                ?
                                <SendCodeForm email={email} setEmail={setEmail} onClickSendHandle={onClickSendHandle} code={code} setEmailSent={setEmailSent} />
                                :
                                ' ' + codeSubmit === code
                                    ?
                                    <NewPasswordForm newPassword={newPassword} setNewPassword={setNewPassword} onClickResetPasswordHandle={onClickResetPasswordHandle} />
                                    :
                                    <SubmitCodeForm givenCode={givenCode} setGivenCode={setGivenCode} setCodeSubmit={setCodeSubmit}></SubmitCodeForm>
                        }

                        <Link href="/register" variant="body2">
                            {"Don't have an account? Sign Up"}
                        </Link>
                    </>
                </Flex>
                <Copyright />
            </Container>
        </ThemeProvider>
    );
}

export default ForgotPassword;