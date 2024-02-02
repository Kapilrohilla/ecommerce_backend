import mongoose from "mongoose";

const MiniBlogSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  Comment: [
    {
      commentText: String,
      user: {
        type: String,
        ref: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
});

const MiniBlogModel = mongoose.model("blog", MiniBlogSchema);

export default MiniBlogModel;
