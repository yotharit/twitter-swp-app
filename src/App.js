import React, { Component } from 'react'
import socketIOClient from 'socket.io-client'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  LineChart,
} from 'recharts'
import moment from 'moment'
import 'moment/locale/th'
import firebase from 'firebase'

// const firebase = require("firebase-admin");
// // const serviceAccount = require('../swp-final-twitter-241418-firebase-adminsdk-cptoe-7952542f40')

const firebaseConfig = {
  apiKey: "AIzaSyBcxWans4hrYr6wpSneSMKRVtiJ0A0qxOE",
  authDomain: "swp-final-twitter-241418.firebaseapp.com",
  databaseURL: "https://swp-final-twitter-241418.firebaseio.com",
  projectId: "swp-final-twitter-241418",
  storageBucket: "swp-final-twitter-241418.appspot.com",
  messagingSenderId: "488173974027",
  appId: "1:488173974027:web:fd4ec21709295992"
}

firebase.initializeApp(firebaseConfig)


class App extends Component {
  constructor() {
    super()
    this.state = {
      message: [],
      endpoint: "104.197.48.192:80" // เชื่อมต่อไปยัง url ของ realtime server
    }
  }

  componentDidMount = () => {
    const { endpoint, message } = this.state
    const socket = socketIOClient(endpoint)
    firebase.database()
      .ref("/data/message")
      .once("value", snap => {
        console.log(Object.values(snap.val()))
        // this.setState({ message: Object.values(snap.val()) })
        let temp = Object.values(snap.val())
        let tempArray = []
        temp.forEach(m => {
          if (m.retweeted_status) {
            let text = 'RT '
            if (m.retweeted_status.extentedTweet) {
              tempArray.push({ text: text + m.retweeted_status.extended_tweet.full_text, timestamp: m.timestamp_ms })
            } else {
              tempArray.push({ text: text + m.retweeted_status.text, timestamp: m.timestamp_ms })
            }
          } else {
            tempArray.push({ text: m.text, timestamp: m.timestamp_ms })
          }
        })
        this.setState({message : tempArray})
      })
    socket.on('new-message', (messageNew) => {
      let temp = message
      temp.push(messageNew)
      this.setState({ message: [...this.state.message, ...temp] })
    })
  }

  render() {

    moment.locale('th')
    const { message } = this.state
    const graphData = []
    message.forEach(m => {
      let text = m.text
      if (text && typeof text === 'string' && text.toUpperCase().includes('#TRADEWAR')) {
        let ms = m.timestamp / 1000
        // let datetime = new Date(m.timestamp * 1000);
        // let hours = datetime.getHours()
        // let minutes = datetime.getMinutes()
        // let hours = Math.floor((ms / 3600000) / 365)
        // let minutes = Math.floor((ms % 3600000) / 60000)
        let time = moment.unix(ms).format('hh:mm')
        const findData = graphData.find(d => d.time === time)
        if (findData) {
          findData.count++
        } else {
          graphData.push({ time: time, count: 1 })
        }
      }
    })

    return (
      <div style={{ marginTop: '5vh' }}>
        <div>
          {/* <BarChart width={1600} height={500} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart> */}
          {/* <LineChart width={400} height={400} data={data}>
            <Line type="monotone" dataKey="uv" stroke="#8884d8" />
          </LineChart> */}

          <LineChart width={730} height={250} data={graphData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>
        <div style={{ height: '600px', overflow: 'scroll' }}>
          {
            message.map((data, i) =>
              <div key={i} style={{ marginTop: 20, paddingLeft: 50 }} >
                {i + 1} : {data.text}
              </div>
            )
          }
        </div>
      </div >
    )
  }
}

export default App
