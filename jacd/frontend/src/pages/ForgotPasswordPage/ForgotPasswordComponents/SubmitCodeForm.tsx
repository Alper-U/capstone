import { Button, TextField } from "@mui/material";
import Flex from "../../../components/Flex/Flex";

interface SubmitCodeFormProps {
    givenCode: string;
    setGivenCode: (arg0: string) => void;
    setCodeSubmit: (arg0: string) => void;
}

const SendCodeForm = (props: SubmitCodeFormProps) => {
    const { givenCode, setGivenCode, setCodeSubmit } = props;
    return(
        <Flex flexDirection='column' alignItems='center' gap="3vh">
            <TextField
                autoFocus
                margin="normal"
                fullWidth
                name="Reset Code"
                label="Reset Code"
                id="Reset Code"
                value={givenCode}
                onChange={(event) => setGivenCode(event.target.value)}
            />
            <Button
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={() => {setCodeSubmit(givenCode)}}
                >
                Submit Code
            </Button>
        </Flex>
    )
}

export default SendCodeForm;