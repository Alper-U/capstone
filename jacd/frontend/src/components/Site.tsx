import React from 'react';
import Home from '../pages/HomePage/Home';
import Login from '../pages/LoginPage/Login';
import Register from '../pages/RegisterPage/Register';
import Project from '../pages/ProjectPage/Project';
import NavigationBar from './NavigationBar/NavigationBar';
import UserNavigationBar from './NavigationBar/UserNavigationBar';
import ApiHelper from './ApiHelper';
import Profile from '../pages/ProfilePage/Profile';
import ForgotPassword from '../pages/ForgotPasswordPage/ForgotPassword';
import {
    Routes,
    Route,
    useNavigate,
    useLocation
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import VisitorProfile from '../pages/ProfilePage/VisitorProfile';
import Chat from '../pages/ChatPage/Chat';
import { toast } from 'react-toastify';

declare module '@mui/material/styles' {
    interface Theme {
        status: {
            danger: string;
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        status?: {
            danger?: string;
        };
    }
}

function Site() {
    const [token, setToken] = React.useState<string | null>(null);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [search, setSearch] = React.useState<string | null>('');
    const [searchId, setSearchId] = React.useState<string | null>('');
    const [searchDescription, setSearchDescription] = React.useState<string | null>('');
    const [searchDeadlineAfter, setSearchDeadlineAfter] = React.useState<string | null>(null);
    const [searchDeadlineBefore, setSearchDeadlineBefore] = React.useState<string | null>(null);

    const logOutBtn = async () => {
        try {
            await ApiHelper('POST', '/auth/logout', token, null)
            localStorage.clear();
            setToken(null);
            navigate('/login');
        } catch (error: any) {
            toast.error(error);
            localStorage.clear();
            setToken(null);
            navigate('/login');
        }
    };

    React.useEffect(() => {
        const isToken = localStorage.getItem('token');
        if (isToken) {
            setToken(isToken);
            if (pathname === '/login' || pathname === '/register') {
                navigate('/home');
            }
        } else if (pathname !== '/login' && pathname !== '/register' && pathname !== '/forgotPassword') {
            navigate('/login');
        }
    }, [token]);

    return (
        <>
            <ToastContainer />
            {token ? pathname == '/home' ? <UserNavigationBar isHome={true}
                search={search}
                setSearch={setSearch}
                searchId={searchId}
                setSearchId={setSearchId}
                searchDescription={searchDescription}
                setSearchDescription={setSearchDescription}
                searchDeadlineAfter={searchDeadlineAfter}
                setSearchDeadlineAfter={setSearchDeadlineAfter}
                searchDeadlineBefore={searchDeadlineBefore}
                setSearchDeadlineBefore={setSearchDeadlineBefore}
                logOutBtn={logOutBtn} title='JACD'></UserNavigationBar>
                : <UserNavigationBar
                    isHome={false}
                    search={search}
                    setSearch={setSearch}
                    searchId={searchId}
                    setSearchId={setSearchId}
                    searchDescription={searchDescription}
                    setSearchDescription={setSearchDescription}
                    searchDeadlineAfter={searchDeadlineAfter}
                    setSearchDeadlineAfter={setSearchDeadlineAfter}
                    searchDeadlineBefore={searchDeadlineBefore}
                    setSearchDeadlineBefore={setSearchDeadlineBefore}
                    logOutBtn={logOutBtn} title='JACD'></UserNavigationBar>
                : <NavigationBar title='JACD'></NavigationBar>}
            <Routes>
                <Route path='/home' element={
                    <Home
                        search={search}
                        searchId={searchId}
                        searchDescription={searchDescription}
                        searchDeadlineAfter={searchDeadlineAfter}
                        searchDeadlineBefore={searchDeadlineBefore}
                    />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register setToken={setToken} />} />
                <Route path="/profile" element={<Profile setToken={setToken} />} />
                <Route path="/project/:name" element={<Project />} />
                <Route path='/forgotPassword' element={<ForgotPassword />} />
                <Route path='/profile/:u_id' element={<VisitorProfile setToken={setToken} />}></Route>
                <Route path='/chat/:u_id/:u_id' element={<Chat />}></Route>
            </Routes>
        </>
    );
}

export default Site;