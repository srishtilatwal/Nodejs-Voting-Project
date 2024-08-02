const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the person data

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new User to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
            // username: response.username
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Login Route
router.post('/login', async(req, res) => {
    try{
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        // Find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exist or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid aadharCardNumber or password'});
        }

        // generate Token 
        const payload = {
            id: user.id,
            
        }
        const token = generateToken(payload);

        // resturn token as response
        res.json({token})
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        // console.log("User Data: ", userData);

        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})






router.put('/profile/password', jwtAuthMiddleware ,async (req, res)=>{
    try{
        const UserId = req.user; // Extract the id from token
         
        const {currenPassword, newPassword} = req.body; // extract current and new password from req body
        
        const user = await User.findById(UserId);

        // if password does not match ,return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid aadharCardNumber or password'});
        }

        user.password = newPassword;
        await user.save(response);


        console.log('Password updated');
        res.status(200).json({message:"Password Updated"});
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



module.exports = router;