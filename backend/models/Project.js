import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  links: [{ type: String }],
  analysis: { 
    type: Object, // Stores the JSON result from Gemini
    default: null 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', ProjectSchema);