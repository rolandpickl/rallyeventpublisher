const { Kafka } = require("kafkajs");
const config = require("./config");
const createConsumer = require("./consumer");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const connectedSockets = new Map();

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/send", (req, res) => {
    if (req.query.msg) {
        io.emit("notification", { notification: req.query.msg });
    }
    res.send("message sent");
});

io.on("connection", (socket) => {
    connectedSockets.set(socket.id, socket);

    socket.on("disconnect", () => {
        console.log(socket.id + " user disconnected");
        connectedSockets.delete(socket.id);
    });

    console.log(socket.id + " user connected");
});

setInterval(() => {
    connectedSockets.forEach((socket, id) => {
        socket.emit("pong", "pong " + id + " " + new Date().valueOf());
    });
}, 5000);

server.listen(3000, () => {
    console.log("listening on *:3000");
});

/*
const kafka = new Kafka(config.kafka);

const main = async () => {

    const consumer = await createConsumer({ kafka, config});


    const shutdown = async () => {
        await consumer.disconnect();
    };

    return shutdown;
};*/
