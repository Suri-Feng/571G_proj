import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useEffect, useState } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    CardHeader
} from '@material-ui/core/'
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import "./index.css";
import { useLocation } from "react-router-dom";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
    pollContract,
    selectAnOption
} from "../util/interact.js"
import ResultModal from './ResultModal.js';

const useStyles = makeStyles(theme => ({
    cardStyle: {
        display: 'block',
        width: '30vw',
        transitionDuration: '0.3s',
        height: '17vw'
    },
    root: {
        flexGrow: 1,
        padding: theme.spacing(2)
    }
}))

export default function PollBoard(props) {
    let loc = useLocation();

    const [status, setStatus] = useState("Hello Please Vote");
    const [selection, setSelection] = useState("");

    const [pollID, setPollID] = useState(0);
    const [name, setName] = useState(0);
    const [description, setPollDescription] = useState("Please select a poll from the dashboard");
    const [data, setData] = useState([]);
    const [walletAddress, setWalletAddress] = useState("");

    const [result, setResult] = useState("");
    const [showModal, setShowModal] = useState(false);


    useEffect(() => { //TODO: implement
        async function fetchData() {
            if(loc.state !== undefined){
                setPollID(loc.state.id);
                setName(loc.state.name);
                setPollDescription(loc.state.description);
                setData(loc.state.options);
                setWalletAddress(loc.state.wallet);
                addSelectListener();
                addViewResultListener();
            }
            console.log(pollID);
            console.log(walletAddress);
        }
        fetchData();
    }, []);

    function addSelectListener() { //TODO: test
        console.log("addViewAllEventsListener");
        pollContract.events.voteDone({}, (error, data) => {
            console.log("entered");
            if (error) {
                console.log("error");
                setStatus("😥 " + error.message);
            } else {
                console.log("what");
                setStatus("🎉 You have voted successfully");
            }
        });
    }

    const onSelectPressed = async (optionIndex) => { //TODO: test
        alert("Hello World!" + optionIndex);
        // const { status } = await selectAnOption(walletAddress, pollID, selection);
        // setStatus(status);
    };

    const onViewResultsPressed = async () => { //TODO: test
        setShowModal(true);
        // const { status } = await viewPollResult(walletAddress, pollID);
        setStatus(status);
    };

    function addViewResultListener() {
        console.log("addResultViewListener");
        // return poll results
        // event resultViewed(bool tie, Selection[] result, State state, bool blind);
        pollContract.events.resultViewed({}, (error, data) => {
            console.log("entered addParticipateAnEventsListener");
            if (error) {
                console.log("error");
            } else {
                const possibleSelection = ["DEFAULT", "A", "B", "C", "D", "E", "F", "G", "H"];
                if (data[2] == 0) {
                    setResult("Voting in progress, please check back later");
                } else {
                    let res = data[1];
                    if (data[0] == true) {
                        let resultMsg = "Tie Between options: "
                        for (let i = 0; i < data[1].length; i++) {
                            resultMsg += possibleSelection[res[i]] + ", ";
                        }
                        setResult(resultMsg);
                    } else {
                        if (res[0] == 0) {
                            setResult("No one voted.");
                        } else {
                            setResult("Most participate voted: " + possibleSelection[res[0]]);
                        }
                    }
                }
                setShowModal(true);
                console.log("Results logged successfully");
            }
        });
    }


    const classes = useStyles()
    return (
        <div className={classes.root}>
            <div><ResultModal result={result} status={showModal}/></div>
            <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
            >
                <Box sx={{ width: '100%' }}>
                    <Stack spacing={2}>
                        <div id="one">{name}</div>
                        <div id="two">{description}</div>
                    </Stack>
                </Box>
                <Grid container direction="row" alignItems="flex-start">

                    <Grid item xs={12} sm={6} md={6}>
                        <div className="c"> <Button onClick={onViewResultsPressed}>View Results</Button> </div>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <div className="c"> <Button ><Link to='/Dashboard' target='_blank'> Back </Link></Button> </div>
                    </Grid>
                </Grid>
                {data.map(elem => (
                    <Grid item xs={12} sm={6} md={3} key={data.indexOf(elem)}>
                        <h1>{elem}</h1>
                        <Button variant="outlined" onClick
                            ={() => onSelectPressed(data.indexOf(elem))}
                        >Select</Button>
                    </Grid>
                ))}
            </Grid>
            <Grid item xs={12}>
                <div className="c"> <Button variant="disabled">Remaining time to show the results</Button> </div>
            </Grid>

        </div>
    )
}