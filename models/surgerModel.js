const mongoose = require('mongoose');
const Counter = require('./counter');

const Schema = mongoose.Schema;

const surgerySchema = new Schema({
  surgeryId: {
    type: String,
    unique: true,
    sparse: true, // ✅ VERY IMPORTANT
    index: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient record must be linked to a doctor']
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    lowercase: true,
    required: true
  },
  procedure: {
    type: String,
    required: true,
    trim: true
  },
  surgeryType: String,
  date: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['incomplete', 'complete'],
    default: 'incomplete',
    index: true
  },
  formData: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });


surgerySchema.pre('save', async function () {
    if (this.surgeryId) return;
  
    const counterDoc = await Counter.findOneAndUpdate(
      { name: 'surgery' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
  
    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
  
    this.surgeryId = `SRG-${datePart}-${String(counterDoc.seq).padStart(4, '0')}`;
  });
  

module.exports = mongoose.model('Surgery', surgerySchema);
