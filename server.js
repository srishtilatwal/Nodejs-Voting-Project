const  express = require ("express");
const app = express();
const db = require('./db');
 require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

// const {jwtAuthMiddleware} = require('./jwt');


const userRouter = require('./router/userRouter');
const candidatesRouter = require('./router/candidatesRouter');



app.use('/user',userRouter);
app.use('/candidate' , candidatesRouter);



app.listen(PORT,()=>{
    console.log('listening on PORT 3000');
})