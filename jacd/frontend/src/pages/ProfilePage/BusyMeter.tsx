import { Box, LinearProgress, Typography } from "@mui/material";
import { useState } from "react";
import ApiHelper from "../../components/ApiHelper";

interface BusyMeterProps {
    busyMeter: any;
}
const BusyMeter = (props: BusyMeterProps) => {
    const {busyMeter} = props;
    return(
        <>
            <Box sx={{ width: '40vw' }} >
                <Typography>Busy Meter</Typography>
                <LinearProgress variant="determinate" value={busyMeter.value} sx={{ height: '15px'}} color={busyMeter.value >= 100 ? "error" : 'success'}/>
            </Box>
        </>
    )
}

export default BusyMeter;