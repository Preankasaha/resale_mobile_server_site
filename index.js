const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
const app = express();
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('resale mobile server is running')
})
app.listen(port, () => console.log(`resale mobile is running on ${port}`))