import mongoose from "mongoose";

const symptomSchema = new mongoose.Schema({
  pain: String,
  itching: String,
  bleeding: String,
  soiling: String,
  prolapsing: String
}, { _id: false });

const followUpItemSchema = new mongoose.Schema({
  completed: { type: Boolean, default: false },
  date: String,
  vasScore: String,
  notes: String,
  symptoms: symptomSchema
}, { _id: false });

const caseSchema = new mongoose.Schema({
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'User',        
        required: [true, 'Patient record must be linked to a doctor']
    },
  date: String,
  patientInitials: String,
  patientAge: String,
  gender: String,

  laserWavelength: { type: String, default: "1470nm" },
  laserPower: { type: String, default: "8W" },
  laserPulseMode: { type: String, default: "3.0s" },

  medication: String,

  diagnostics: {
    fissure: { observed: Boolean, treated: Boolean },
    skinTags: { observed: Boolean, treated: Boolean },
    leftoverHematoma: { observed: Boolean, treated: Boolean },
    fistula: { observed: Boolean, treated: Boolean },
    cryptitis: { observed: Boolean, treated: Boolean },
    analRectumProlapse: { observed: Boolean, treated: Boolean },
    analStenosis: { observed: Boolean, treated: Boolean },
    analEczema: { observed: Boolean, treated: Boolean },
    analVeinThrombosis: { observed: Boolean, treated: Boolean },
    others: {
      observed: Boolean,
      treated: Boolean,
      description: String
    }
  },

  treatmentMethods: {
    medication: Boolean,
    sclerosation: Boolean,
    infraredCoagulation: Boolean,
    rubberBandLigation: Boolean,
    halDghal: Boolean,
    surgery: Boolean,
    longo: Boolean,
    radioFrequencyAblation: Boolean
  },

  anaesthesia: {
    spinal: { type: String, default: "no" },
    saddleBlock: { type: String, default: "no" },
    pudendusBlock: { type: String, default: "no" },
    general: { type: String, default: "no" },
    regional: { type: String, default: "no" },
    local: { type: String, default: "no" }
  },

  hasPreviousOp: { type: String, default: "no" },
  previousOperation: String,

  postoperativeMedication: String,
  intraOperativeData: [String],

  pain: String,
  itching: String,
  bleeding: String,
  soiling: String,
  prolapsing: String,

  vasScore: String,

  followUp: {
    twoWeeks: followUpItemSchema,
    sixWeeks: followUpItemSchema,
    threeMonths: followUpItemSchema,
    sixMonths: followUpItemSchema,
    twelveMonths: followUpItemSchema,
    twoYears: followUpItemSchema,
    threeYears: followUpItemSchema,
    fiveYears: followUpItemSchema
  }

}, { timestamps: true });

const LHP = mongoose.model('LHP',caseSchema)

module.exports = LHP
