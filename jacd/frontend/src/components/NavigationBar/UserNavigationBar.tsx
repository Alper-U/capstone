import * as React from 'react';
import { styled, alpha, createTheme, ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import DumbbellIcon from '@mui/icons-material/FitnessCenterOutlined';
import { DesktopDateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Badge, Modal } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ApiHelper from '../ApiHelper';
import NotificationTile from './NotificationTile';
import GroupIcon from '@mui/icons-material/Group';
import { toast } from 'react-toastify';

interface UserNavigationBarProps {
    title: string;
    logOutBtn(): void;
    search: string | null;
    setSearch(arg0: string | null): void;
    searchId: string | null;
    setSearchId(arg0: string | null): void;
    searchDescription: string | null;
    setSearchDescription(arg0: string | null): void;
    searchDeadlineAfter: string | null;
    setSearchDeadlineAfter(arg0: any): void;
    searchDeadlineBefore: string | null;
    setSearchDeadlineBefore(arg0: any): void;
    isHome: boolean;
}

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

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
    gap: '10px',
    borderRadius: '14px',
};

export default function PrimarySearchAppBar(props: UserNavigationBarProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const isMenuOpen = Boolean(anchorEl);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    const getNotifications = async () => {
        const response: any = await ApiHelper('GET', `/requests`, token, null);
        setNotifications(response.requests);
        if (response.requests.length == 0) setAnchorElNotifications(null);
    }
    const [notifications, setNotifications] = React.useState([]);
    const [anchorElNotifications, setAnchorElNotifications] = React.useState<null | HTMLElement>(null);
    const isNotificationOpen = Boolean(anchorElNotifications);

    const handleOpenNotifications = async (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNotifications(event.currentTarget);
    };

    const [friends, setFriends] = React.useState<object[]>([]);
    const [friendsModal, setFriendsModal] = React.useState(false);
    const handleOpenFriends = () => {
        setFriendsModal(true);
    };
    
    const getFriends = async () => {
        try {
            const response: any = await ApiHelper('GET', '/friends', token, null);
            console.log(response)
            const friendList: object[] = []
            response.friends.forEach(async (friend: { friend_id: number; }) => {
                try {
                    const user: any = await ApiHelper('GET', '/users/' + friend.friend_id, token, null);
                    friendList.push({
                        id: friend.friend_id,
                        name: `${user.fname} ${user.lname}`
                    })
                } catch (error: any) {
                    toast.error(error)
                }
            });
            setFriends(friendList)
        } catch (error: any) {
            toast.error(error);
        }
    };
    
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationsClose = () => {
        setAnchorElNotifications(null);
    };

    const handleNavigateProfile = () => {
        setAnchorEl(null);
        navigate('/profile');
    }

    React.useEffect(() => {
        const interval = setInterval(() => {
            getNotifications();
        }, 2000);
        getFriends();
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleNavigateProfile}>My Profile</MenuItem>
            <MenuItem onClick={() => { props.logOutBtn(); handleMenuClose(); }}>Log Out</MenuItem>
        </Menu>
    );

    const notificationsId = 'primary-search-account-notifications';
    const renderNotifications = (
        <Menu
            anchorEl={anchorElNotifications}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={notificationsId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isNotificationOpen}
            onClose={handleNotificationsClose}
        >
            {[...notifications].map((request: any, index) => {
                return(
                    <MenuItem>
                        <NotificationTile request={request} index={index} key={index}/>
                    </MenuItem> 
                )
            })}
        </Menu>
    )

    const theme = createTheme({
        palette: {
            primary: {
                main: '#923ADC',
            },
        },
    });

    const [advancedSearchClicked, setAdvancedSearchClicked] = React.useState(false);
    const handleAdvancedSearch = () => {
        if (advancedSearchClicked) {
            props.setSearch('')
            props.setSearchId('')
            props.setSearchDescription('')
            props.setSearchDeadlineAfter(null)
            props.setSearchDeadlineBefore(null)
        }
        setAdvancedSearchClicked(!advancedSearchClicked)
    }

    const handleClearSearch = () => {
        props.setSearch('')
        props.setSearchId('')
        props.setSearchDescription('')
        props.setSearchDeadlineAfter(null)
        props.setSearchDeadlineBefore(null)
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Box onClick={() => { navigate('/home') }} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <DumbbellIcon fontSize='large'></DumbbellIcon>
                            <Typography
                                variant="h3"
                                noWrap
                                component="div"
                                sx={{ fontFamily: 'fantasy', display: { xs: 'none', sm: 'block' }, margin: '0 0 0 15px' }}
                            >
                                {props.title}
                            </Typography>
                        </Box>
                        {props.isHome &&
                            <>
                                <Search >
                                    <SearchIconWrapper>
                                        <SearchIcon />
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        sx={{ width: '200px' }}
                                        placeholder="Search Tasks…"
                                        value={props.search}
                                        onChange={(event) => props.setSearch(event.target.value)}
                                        inputProps={{ 'aria-label': 'search' }}
                                    />
                                </Search>
                                {advancedSearchClicked &&
                                    <>
                                        <Search>
                                            <SearchIconWrapper>
                                                <SearchIcon />
                                            </SearchIconWrapper>
                                            <StyledInputBase
                                                sx={{ width: '100px' }}
                                                placeholder="ID..."
                                                value={props.searchId}
                                                onChange={(event) => props.setSearchId(event.target.value)}
                                                inputProps={{ 'aria-label': 'search' }}
                                            />
                                        </Search>
                                        <Search>
                                            <SearchIconWrapper>
                                                <SearchIcon />
                                            </SearchIconWrapper>
                                            <StyledInputBase
                                                sx={{ width: '300px' }}
                                                placeholder="Search Descriptions..."
                                                value={props.searchDescription}
                                                onChange={(event) => props.setSearchDescription(event.target.value)}
                                                inputProps={{ 'aria-label': 'search' }}
                                            />
                                        </Search>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <Search>
                                                <DesktopDateTimePicker
                                                    label="Deadline After"
                                                    value={props.searchDeadlineAfter}
                                                    onChange={(newVal) => props.setSearchDeadlineAfter(newVal)}
                                                />
                                            </Search>
                                            <Search>
                                                <DesktopDateTimePicker
                                                    label="Deadline Before"
                                                    value={props.searchDeadlineBefore}
                                                    onChange={(newVal) => props.setSearchDeadlineBefore(newVal)}
                                                />
                                            </Search>
                                        </LocalizationProvider>
                                        <Typography variant="body2" sx={{ marginRight: '10px', textDecoration: 'underline', cursor: 'pointer', }} onClick={() => handleClearSearch()}>Clear</Typography>
                                    </>
                                }

                                <Typography variant="body2" sx={{ textDecoration: 'underline', cursor: 'pointer', }} onClick={() => handleAdvancedSearch()}>Advanced Search</Typography>

                            </>
                        }
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={handleOpenFriends}
                        >
                            <GroupIcon />
                        </IconButton>
                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={handleOpenNotifications}
                        >
                            <Badge badgeContent={notifications.length} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="account of current user"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>
                {renderMenu}
                {renderNotifications}
                <Modal
                    open={friendsModal}
                    onClose={() => setFriendsModal(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">Friends List</Typography>
                        {(friends.length > 0
                            ?
                            [...friends]
                                .map((friend: any, index) => {
                                    return (
                                        <Box key={index}
                                            sx={{
                                                display: 'flex', justifyContent: 'center',
                                                padding: '4px 0 4px 0', marginTop: '15px',
                                                bgcolor: 'GhostWhite', boxShadow: 2, cursor: 'pointer',
                                                '&:hover': { boxShadow: 5 }, borderRadius: '10px', width: '50%',
                                            }}
                                            onClick={() => { navigate(`/chat/${userId}/${friend.id}`), navigate(0) }}>
                                            <Typography fontWeight='bold'>{friend.name}</Typography>
                                        </Box>
                                    )
                                })
                            :
                            <Box> No Friends Add some from the project pages! </Box>
                        )}
                    </Box>
                </Modal>
            </Box>
        </ThemeProvider >
    );
}