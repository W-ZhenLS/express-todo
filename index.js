const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./dbconfig');
const todoItemRoute = require('./routes/todo.item');

app.use(express.json());    // Parse Request Body in JSON
app.use(cors());

app.use('/todos', todoItemRoute);   // let todoItem router handle all traffic to /todos

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});