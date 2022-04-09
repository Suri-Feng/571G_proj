import React from 'react'
import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles'
import {
    Grid,
    Card,
    CardContent,
    Typography,
    CardHeader
} from '@material-ui/core/'
import {
    pollContract,
    loadAllEvents,
    createFakeEvent,
    getCurrentWalletConnected,
    viewResult,
    filterPolls,
    viewAnEvent
} from "../util/interact.js"
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import ResultModal from './ResultModal.js';
import "./index.css";

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';

import { useHistory } from "react-router-dom";
const Dashboard = (props) => {
    const [events, setEvents] = useState([]);
    const [walletAddress, setWallet] = useState();
    const [result, setResult] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState("Show status here");
    const [filters, setFilters] = React.useState([]);
    const history = useHistory();

    //called only once
    useEffect(() => { //TODO: implement
        addResultViewListener();
        viewFilterPollsListener();
        participateEventListener();
        async function fetchData() {
            const events = await loadAllEvents();
            const { address, status } = await getCurrentWalletConnected();
            setWallet(address);
            setEvents(events);
        }
        fetchData();
    }, []);

    // Participate one event: in contract view one event
    const onParticipatePressed = async (pollID) => {
        const { status } = await viewAnEvent(walletAddress, pollID);
    };

    //TODO: test
    // Expected behavior: 1. gas fee. 2. Display the result in pop up modal
    const onViewResultsPressed = async (pollID) => {
        const { status } = await viewResult(walletAddress, pollID);
    };

    // Expected behavior: when results is returned show it in the pop up window
    // return value by the contract event:
    // event resultViewed(bool tie, Selection[] result, State state, bool blind);
    function addResultViewListener() {
        console.log("addResultViewListener");
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

    const onCreatePollPressed = async () => {
        // TODO: create pull -> copy paste this part to the first page
        // This one is just a fake creation we need to grab information from the firstpage.js and then create
        const pollDescription = "on chain fake event select A if you are happy to day, select B if you feel mad today, select C if you feel sad today";
        const pollName = "Fake Chain Poll 1";
        const pollDuration = 259200;
        const isBlind = false;
        const isAboutDao = false;
        const options = [1, 2, 3];
        const optionDescription = ["A", "B", "C"];
        const { status2 } = await createFakeEvent(walletAddress, pollName, pollDescription, pollDuration, isBlind, isAboutDao, options, optionDescription);
        setStatus(status2);
    };


    function participateEventListener() {
        pollContract.events.pollViewed({}, (error, data) => {
            if (error) {
                console.log("polls viewed failed with error" + error);
                alert("Error message: " + error);
            } else {
                let pollName = data.returnValues.poll[3];
                let pollDescription = data.returnValues.poll[4];
                let pollId = data.returnValues.poll[1];
                let choseFrom = data.returnValues.poll[9];
                let optionsDescription = data.returnValues.poll[10];
                history.push({pathname: '/PollBoard', state: { id: pollId, description: pollDescription, name: pollName, options: optionsDescription, wallet: walletAddress }});
            }
        });
    }

    const useStyles = makeStyles(theme => ({
        largeIcon: {
            '& svg': {
                fontSize: 60
            }
        },
        root: {
            flexGrow: 1,
            padding: theme.spacing(2)
        },
        cardEle: {
            height: "100%",
            margin: "1rem",
        },
        cardText: {
            fontSize: "2vi",
        }
    }))

    const handleModalClose = () => {
        setShowModal(false);
    }

    // TODO: Need Test
    const handleChange = async (event) => {
        const {
            target: { value },
        } = event;
        let isByMe = value.includes("Created By Me")? true: false;
        let isAboutDao = value.includes("About Dao")? 1:0;
        isAboutDao = value.includes("Not About Dao")? 2: isAboutDao;
        let isBlind = value.includes("Blind Vote")? 1:0;
        isBlind = value.includes("Non-Blind Vote")? 2:isBlind;
        if(value.includes("All")){
            isByMe = false;
            isAboutDao = 0;
            isBlind = 0;
        }
        setFilters(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
        await filterPolls(walletAddress, isByMe, isAboutDao, isBlind);
    };

    // TODO：Need test
    function viewFilterPollsListener() {
        console.log("viewFilterPollsListener");
        pollContract.events.pollsViewed({}, (error, data) => {
            console.log("entered viewAllPollsListener");
            if (error) {
                console.log("polls viewed failed with error" + error);
                alert("Error message: " + error);
            } else {
                console.log("viewed filteredPolls successfully");
                console.log(data);
            }
        });
    }

    function getStyles(selection, filters, theme) {
        return {
          fontWeight:
          filters.indexOf(selection) === -1
              ? theme.typography.fontWeightRegular
              : theme.typography.fontWeightMedium,
        };
      }

    const classes = useStyles();
    const data = events;
    const selections = [
        'All',
        'About Dao',
        'Not About Dao',
        'Blind Vote',
        'Non-Blind Vote',
        'Created By Me'
    ];
    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };
    
    const theme = useTheme();

    return (
        <div className={classes.root}>
            <div><ResultModal result={result} status={showModal} handleModalClose={handleModalClose} /></div>
            <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="flex-start"
                alignItems="stretch"
            >
                <Grid item xs={12} >
                    <Link className="btn btn-create" to={{ pathname: '/PollFeature' }}>Create a <span>New Poll</span></Link>
                </Grid>
                <Grid item xs={12} >
                    <div position="absolute" top="0" >
                        <a href="https://faucet.egorfine.com/" target='_blank' className="linkToFaucet" >Get more <span >testnet tokens</span></a>
                    </div>
                    <div className="dropDown">
                        <Box sx={{ minWidth: 130, maxWidth: 200, ml: "80%", borderColor: 'primary.main' }} >
                            <FormControl sx={{ m: 1, width: 300 }}>
                                <InputLabel id="multiple-filter-label">Filter</InputLabel>
                                <Select
                                    labelId="multiple-filter-label"
                                    id="multiple-filter"
                                    multiple
                                    value={filters}
                                    onChange={handleChange}
                                    input={<OutlinedInput label="Filter" />}
                                    MenuProps={MenuProps}
                                >
                                    {selections.map((selection) => (
                                        <MenuItem
                                            key={selection}
                                            value={selection}
                                            style={getStyles(selection, filters, theme)}
                                        >
                                            {selection}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card className={classes.cardEle}>
                        <CardHeader title={`Poll : 0`} subheader={`Participants: 0`} />
                        <CardContent>
                            <Typography className="cut-text" gutterBottom>
                                Just a template, please create a new poll.
                            </Typography>
                        </CardContent>
                        <CardActions position="center">
                            <Grid item xs={6}>
                                <Link to={{ pathname: '/PollBoard', state: { id: 1, name: 'sabaoon', shirt: 'green' } }} >Test</Link>
                            </Grid>
                            <Grid item xs={6}><Button size="small" onClick={() => { alert("✔️ Please add a new event or join an existing event!"); }}>View Results</Button>
                            </Grid>
                        </CardActions>
                    </Card>
                </Grid>
                {data.map(elem => (
                    <Grid item xs={12} sm={6} md={3} key={data.indexOf(elem)}>
                        <Card className={classes.cardEle}>
                            <CardHeader
                                title={`Poll : ${elem.name}`}
                                subheader={`Participants: ${elem.participants}`}
                            />
                            <CardContent>
                                <Typography className="cut-text" gutterBottom>
                                    {elem.description}
                                </Typography>
                            </CardContent>
                            <CardActions >
                                <Grid item xs={6}>
                                    <Button size="small" onClick
                                        ={() => onParticipatePressed(elem.id)}>PARTICIPATE</Button>
                                </Grid>
                                <Grid item xs={6}><Button size="small" onClick
                                    ={() => onViewResultsPressed(elem.id)}>View Results</Button>
                                </Grid>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}

            </Grid>

        </div>
    );
};
export default Dashboard;