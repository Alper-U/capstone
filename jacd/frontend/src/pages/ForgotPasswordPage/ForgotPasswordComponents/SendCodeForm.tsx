import { Button, TextField } from "@mui/material";
import Flex from "../../../components/Flex/Flex";

interface SendCodeFormProps {
    code: string;
    email: string;
    setEmail: (arg0: string) => void;
    setEmailSent: (arg0: boolean) => void;
    onClickSendHandle: (arg0: string) => void;
}

const SendCodeForm = (props: SendCodeFormProps) => {
    const { code, email, setEmail, onClickSendHandle, setEmailSent } = props;
    return(
        <Flex flexDirection='column' alignItems='center' gap="3vh">
            <TextField
                autoFocus
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                />
            <Button
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={() => {setEmail(email); onClickSendHandle(code); setEmailSent(true)}}
                >
                Send Code
            </Button>
        </Flex>
    )
}

export default SendCodeForm;