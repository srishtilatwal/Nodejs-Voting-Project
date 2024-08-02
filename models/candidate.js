const  mongoose = require("mongoose") ;
const candidateSchema = new mongoose.Schema({
    name: { 
        type : String,
        required:true
    },
   
    party:{
        type:String,
        requied:true
    },
    age:{
        type : Number,
        required:true
    },
    // votes detail collected through voter
    votes:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        // date already have date function
        votedAt:{
            type:Date,
            default:Date.now()
        }
    }
    ],
    voteCount:{
        type:Number,
        default:0
    }

   
});





const Candidate =  mongoose.model("Candidate",candidateSchema);
module.exports =Candidate;