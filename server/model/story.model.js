// // Import Mongoose 
// import mongoose from "mongoose"


// // Route Handler 
// const storySchema = new mongoose.Schema({
//     user:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref : "User" //reference to the post model
//     },
//     storyurl: {
//         type:String,
//         required:true,
//     },    
// },{timestamps:true})


// // Export 
// const Story = mongoose.model("Story", storySchema) 
// export default Story;
import mongoose from "mongoose"

const StorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24-hour expiry
    views: { type: Number, default: 0 },
    viewers: [
        {
            viewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            viewedAt: { type: Date, default: Date.now }
        }
    ]
});
const Story = mongoose.model("Story", StorySchema) 
export default Story;
// module.exports = mongoose.model("Story", StorySchema);
