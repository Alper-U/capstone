import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import Flex from '../../components/Flex/Flex';
import ApiHelper from '../../components/ApiHelper';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const Chat = () => {
    const [messages, setMessages] = React.useState([]);
    const [message, setMessage] = React.useState('');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    const params = useParams();
    const [userName, setUserName] = React.useState('');

    const getMessages = async () => {
        try {
            const user: any = await ApiHelper('GET', `/users/${params.u_id}`, token, null);
            setUserName(`${user.fname} ${user.lname}`)
            const response: any = await ApiHelper('GET', '/messages/' + params.u_id, token, null)
            setMessages(response.messages)
        } catch (error: any) {
            toast.error(error);
        }
    };
    const handleSendClick = async () => {
        if (message.replace(/\s/g, '').length) {
            try {
                const body = {
                    message
                }
                await ApiHelper('POST', '/messages/' + params.u_id, token, body)
                setMessage('')
                getMessages();
            } catch (error: any) {
                toast.error(error);
            }
        }
    };
    const [friends, setFriends] = React.useState<object[]>([]);
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

    React.useEffect(() => {
        if(!token) navigate('/login');
        getFriends();
        getMessages();
    }, [])

    React.useEffect(() => {
        const interval = setInterval(() => {
            getMessages()
        }, 1000);
        return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    return (
        <Flex justifyContent='center'>
            <Box sx={{ margin: '20px 100px 0 20px' }}>
                <Typography sx={{ marginBottom: '10px', width: '25vw' }} variant='h4'>Friends List</Typography>
                {(friends.length > 0
                    ?
                    [...friends]
                        .map((friend: any, index) => {
                            return (
                                <Box key={index}
                                    sx={{
                                        display: 'flex', justifyContent: 'center', 
                                        padding:'4px 0 4px 0', marginTop: '15px',
                                        bgcolor: 'GhostWhite', boxShadow: 2, cursor: 'pointer',
                                        '&:hover': { boxShadow: 5 }, borderRadius: '10px', width: '50%',
                                        }}
                                        onClick={() => {navigate(`/chat/${userId}/${friend.id}`), navigate(0)}}>
                                    <Typography fontWeight='bold'>{friend.name}</Typography>
                                </Box>
                            )
                        })
                    :
                    <Box></Box>
                )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '80vw', margin: '20px 0 0 20px' }}>
                <Typography variant='h4' sx={{ margin: '0 0 20px 10px' }}>{userName}</Typography>
                <Box sx={{
                    display: 'flex', flexDirection: 'column-reverse', height: '60vh',
                    overflow: 'auto', border: '2px solid Lavender', borderRadius: '10px',
                    padding: '10px', width: '39vw'
                }}>
                    {(messages.length > 0
                        ?
                        [...messages]
                            .reverse()
                            .map((chatMessage: any, index) => {
                                return (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: chatMessage.sender_id == userId ? 'flex-end' : 'flex-start' }} key={index}>
                                        {(chatMessage.sender_id == userId
                                            ? <></>
                                            : <Typography sx={{ fontWeight: 'bold' }}>{userName} </Typography>
                                        )}

                                        <Box sx={{
                                            backgroundColor: chatMessage.sender_id == userId ? 'CornflowerBlue' : 'Gainsboro',
                                            padding: '6px 10px 8px 10px', borderRadius: '10px', width: 'fit-content',
                                            color: chatMessage.sender_id == userId ? 'white' : 'black',
                                            maxWidth: '35vw', display: 'flex', flexWrap: 'wrap', margin: '0 0 5px 20px',
                                        }} title={chatMessage.creation_date} >{chatMessage.message}</Box>
                                    </Box>
                                )
                            })
                        :
                        <Box>
                            No Messages
                        </Box>
                    )}
                </Box>

                <Flex alignItems='center'>
                    <TextField sx={{ width: '40vw', marginTop: '10px' }} value={message} onChange={(event) => { setMessage(event.target.value) }} id="filled-basic" label="Message..." variant="filled" />
                    <Button onClick={() => handleSendClick()}>Send</Button>
                </Flex>
            </Box>
        </Flex>
    )
}

export default Chat