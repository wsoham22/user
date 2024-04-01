const express = require("express");
const app = express();
const cors = require("cors");
const port = 4000;
app.use(express.json());
const userroutes = require("./routes/userroutes.js");
app.use('/user',userroutes);
app.use(cors());
const connectDB = require("./config/database.js");
connectDB();
app.listen(port,()=>{
    console.log(`Server is listening on port ${port}`);
});