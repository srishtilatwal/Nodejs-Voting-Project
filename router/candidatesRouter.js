const express = require("express");
const router = express.Router();
const User = require("../models/user");
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require("../models/candidate");
const { use } = require("passport");



 const checkAdminRole = async(userID)=>{
    try{
        const user = await User.findById(userID);
       if(user.role === 'admin') {
        return true;
       }

    }catch(error){
        return false;
    }
 }



router.post('/', jwtAuthMiddleware , async (req, res) =>{
    try{

        if(!await checkAdminRole(req.user.id))
         return res.status(403).json({message:"user is not admin "});
        
        const data = req.body // Assuming the request body contains the person data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new User to the database
        const response = await newCandidate.save();
        console.log('data saved');

        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})






router.put('/:candidateID', jwtAuthMiddleware,async (req, res)=>{
    try{

        if(! checkAdminRole(req.user.id))
            return res.status(403).json({message:"user is not admin "});



            const candidateID = req.params.candidateID; // Extract the id from the URL parameter
            const updatedCandidateData = req.body; // Updated data for the person
    
            const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
                new: true, // Return the updated document
                runValidators: true, // Run Mongoose validation
            })
    
            if (!response) {
                return res.status(404).json({ error: 'Candidate not found' });
            }
    
            console.log('candidate data  updated');
            res.status(200).json(response);
        }catch(err){
            console.log(err);
            res.status(500).json({error: 'Internal Server Error'});
        }
})




router.delete('/:candidateID', jwtAuthMiddleware , async (req, res)=>{
    try{

        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message:"user is not admin "});



            const candidateID = req.params.candidateID; // Extract the id from the URL parameter
           
    
            const response = await Candidate.findByIdAndDelete(candidateID);
    
            if (!response) {
                return res.status(403).json({ error: 'Candidate not found' });
            }
    
            console.log('candidate deleted');
            res.status(200).json(response);
        }catch(err){
            console.log(err);
            res.status(500).json({error: 'Internal Server Error'});
        }
})


router.post('/vote/:candidateID', jwtAuthMiddleware , async (req, res)=>{

     candidateID = req.params.candidateID;
            userID = req.user.id;
    try{

        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message:" Candidate not found"})
        }


        const user = await User.findById(userID);
        if(!user){
            return res.status(404).json({message:" User not found"})
        }

        
        if(user.role === 'admin'){
            return res.status(400).json({message:'Admin is not allowed'});
        }
        
        if(user.isVoted){
            return res.status(400).json({message:'You have already vote'});
        }
        


        candidate.votes.push({user: userID});
        candidate.voteCount++;
        await candidate.save();

        // update the user documents

        user.isVoted = true;
        await user.save();
        
        
        res.status(200).json({message:'vote recorded successfully'});

        



    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }

});

router.get('/vote/count', async(req,res)=>{
    try{
      const candidate = await Candidate.find().sort({voteCount:'desc'});
      const voteRecord = candidate.map((data)=>{
        return {
            Party: data.party,
            count: data.voteCount
        }
      });
return res.status(200).json(voteRecord);


    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



router.get('/',async(req,res)=>{
    try{

        const candidate = await Candidate.find({},'name party - _id');

        res.status(200).json(candidate);

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


module.exports = router;