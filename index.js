const express = require('express');
const cors = require('cors');
const app = express();
const {Server} = require("socket.io");
const bodyParser = require('body-parser');
const http = require('http');
const httpServer = http.createServer(app);
const path = require('path');
let ip = require('ip');
const buffers = require('buffer');
console.log(ip.address())
let i = 0
let color = [0 , 0 ,0]
const port = 3000;

/*const io = new Server(httpServer, {
    cors : {
        origin : '*'
    }
});*/

// middelware
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req,res)=>{
    console.log("grt")
    res.send({"msg": "ok get"})
})
// routes
app.post('/pos', (req, res) => {
    const pos = req.body
    console.log("pos")
    console.log(pos)
    //io.emit("Sendpos", pos)
    res.send({"msg": "ok post"})
});



httpServer.listen(port, () => {
    console.log(`On écoute le port n°${port}`)
});



