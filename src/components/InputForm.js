import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { CardActions } from 'material-ui';
import { DatePicker } from 'antd';
import { Form, Input, Select, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import CircularProgress from '@mui/material/CircularProgress';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

import PollCreationModal from './PollCreationModal.js';
import { useEffect, useState } from "react";
import {
  pollContract,
  createFakeEvent,
  getCurrentWalletConnected
} from "../util/interact.js"
import { AlternateEmail } from '@mui/icons-material';

export default function AddressForm() {

  const [walletAddress, setWallet] = useState();
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    addNewEventCreatedListener();
    async function fetchData() {
      const { address, status } = await getCurrentWalletConnected();
      if (typeof (status) == "string" && status.includes("Rejected")) {
        alert(status);
        location.href = "/";
      }
      setWallet(address);
    }
    fetchData();
  }, []);

  function createNewElement() {
    // First create a DIV element.
    var txtNewInputBox = document.createElement('div');

    // Then add the content (a new input box) of the element.
    txtNewInputBox.innerHTML = "<input type='text' id='newInputBox'>";

    // Finally put it where it is supposed to appear.
    document.getElementById("newElementId").appendChild(txtNewInputBox);
  }

  var options = [];
  var optionDescription;

  const onFinish = values => {
    if (values["choice"] == null || values["choice"].length < 2) {
      alert("Please provide at least 2 choices. ")
      return;
    }
    let s = values["choice"].length;
    for (let i = 0; i < s; ++i) {
      // keyArray.push(values["choice"][i].first);
      valueArray.push(values["choice"][i].last);
    }
    // localStorage.setItem("keyArray", keyArray);
    localStorage.setItem("valueArray", valueArray);
    let s1 = valueArray.length;
    console.log(s1);
    // options = keyArray;
    for (let i = 0; i < valueArray.length; ++i) {
      options.push(i + 1);
    }
    optionDescription = valueArray;
    keyArray = [];
    valueArray = [];
    onCreatePollPressed();
  };


  const onCreatePollPressed = async () => {
    console.log("onCreatePollPressed");
    console.log(walletAddress);

    const pollName = document.getElementById("pollName").value;
    const pollDescription = document.getElementById("pollDescription").value;
    const pollDuration = document.getElementById("pollDuration").value * 60;
    const isBlind = document.getElementById("blindVote").checked;
    const isAboutDao = document.getElementById("aboutDao").checked;

    if (pollName.length == 0) {
      alert("Please enter the poll name to proceed. ")
      return;
    }
    if (pollDescription.length == 0) {
      alert("Please provide your event description. ")
      return;
    }
    const res = await createFakeEvent(walletAddress, pollName, pollDescription, pollDuration, isBlind, isAboutDao, options, optionDescription);
    //alert("Event creation request Submitted");
    setLoading(true);
    if (typeof (res) === "string" && res.includes("rejected")) {
      setLoading(false);
    }
  };

  // return a poll object polls[pollId]
  // Should work as just to display the error message
  function addNewEventCreatedListener() {
    pollContract.events.pollCreated({}, (error, data) => {
      setLoading(false);
      if (error) {
        alert("Error message: " + error);
      } else {
        const time = Math.ceil(+data.returnValues.dur / 60);
        setResult(data.returnValues.name + " created. It will end after " + time + " minutes.");
        setShowModal(true);
        console.log(data.returnValues);
      }
    });
  }

  const [form] = Form.useForm();
  var keyArray = [];
  var valueArray = [];

  const handleChange = () => {
    form.setFieldsValue({ sights: [] });
  };

  const handleModalClose = () => {
    setShowModal(false);
  }

  var count = 0;
  var des;
  return (
    <React.Fragment>
      <div><PollCreationModal result={result} status={showModal} handleModalClose={handleModalClose} /></div>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="pollName"
            name="pollName"
            label="Poll Name"
            fullWidth
            autoComplete="given-name"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            type="number"
            id="pollDuration"
            name="pollDuration"
            label="Poll Duration (in minutes)"
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="pollDescription"
            name="pollDescription"
            label="Poll Description"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          Blind Vote <input type="checkbox" id="blindVote" />
        </Grid>
        <Grid item xs={12} sm={6}>
          Check if this poll is about DAO<input type="checkbox" id="aboutDao" />
        </Grid>

        <Grid item xs={12}>
          <Form name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
            <Form.List name="choice">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    des = "Option " + count,
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} >
                      <Form.Item
                        {...restField}
                        name={[name, 'last']}
                        rules={[{ required: true, message: 'Missing key description' }]}
                      >
                        <Input placeholder={"Choice Decription"} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add a Selection
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          {loading && <div><CircularProgress color="inherit" /><span className="spinningInfo">Information Retrieving in progress</span></div>}
        </Grid>
        
        {/* <Grid item xs={12} sm={12}>
        <button onClick={() => onCreatePollPressed()}> Submit2 </button>
        </Grid> */}
      </Grid>
    </React.Fragment>
  );
}