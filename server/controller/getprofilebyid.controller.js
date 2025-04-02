import Profile from "../model/profile.model.js"
import User from "../model/user.model.js"

export const getprofilebyid =async (req,res)=>{
    try{
        const profileid=req.params.profileid
        if(profileid){
            console.log(profileid);
            
            const user=await User.findById(profileid).populate('profile');
            console.log(user);
            if(!user){   
                return res.status(404).json({
                    success:false,
                    message:"user not found"
                })
            }
            
            return res.status(200).json({
                success:true,
                message:"get profile successfully",
                profile:user.profile
            })
            }else{
            return res.status(404).json({
                success:false,
                message:"profileid is not  found"
            })
        }
    }catch(error){
        return res.status(500).json({
            success:false,
            message:`somethong went wrong while getprofile and error is ${error}`
        })
    }
}

// import Profile from "../model/profile.model.js"
// import User from "../model/user.model.js"

export const getUserProfileById =async (req,res)=>{
    try{
        const userId=req.params.userId
        if(userId){
            console.log(userId);
            
            const user=await User.findById(userId).populate('profile');
            console.log(user);
            if(!user){   
                return res.status(404).json({
                    success:false,
                    message:"user not found"
                })
            }
            
            return res.status(200).json({
                success:true,
                message:"get profile successfully",
                user:user
            })
            }else{
            return res.status(404).json({
                success:false,
                message:"userId is not  found"
            })
        }
    }catch(error){
        return res.status(500).json({
            success:false,
            message:`somethong went wrong while getprofile and error is ${error}`
        })
    }
}