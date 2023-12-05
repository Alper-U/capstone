import { Button, TextField } from "@mui/material";
import Flex from "../../../components/Flex/Flex";

interface NewPasswordFormProps {
    newPassword: string;
    setNewPassword: (arg0: string) => void;
    onClickResetPasswordHandle: (arg0: string) => Promise<void>;
}

const NewPasswordForm = (props: NewPasswordFormProps) => {
    const { newPassword, setNewPassword, onClickResetPasswordHandle } = props;
    return(
        <Flex flexDirection='column' alignItems='center' gap="3vh">
            <TextField
                autoFocus
                margin="normal"
                fullWidth
                id="newPassword"
                label="New Password"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
            />
            <Button
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={() => onClickResetPasswordHandle(newPassword)}
                >
                Reset Password
            </Button>
        </Flex>
    )
}

export default NewPasswordForm;