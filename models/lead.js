const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  status: { 
    type: String, 
    enum: ["New", "Contacted", "Interested", "Follow-up", "Closed", "Lost"],
    default: "New"
  },
  nextFollowUp: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Lead", leadSchema);