const Surgery = require("../models/surgerModel");

exports.getAllSurgeries = async (req, res) => {
  try {
    const { status, doctor, procedure } = req.query;
    
    // FIXED: Explicitly parse pagination strings to actual numbers early
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);

    const query = {};
    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (procedure) query.procedure = procedure;

    const surgeries = await Surgery.find(query)
      .populate('doctor', 'fullname email')
      .select('-formData')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Surgery.countDocuments(query);

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: surgeries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch surgeries' });
  }
};

exports.addSurgery = async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      gender,
      procedure,
      surgeryType,
      date,
      formData,
      status,
      formVersion
    } = req.body;

    const surgery = await Surgery.create({
      doctor: req.user.id, 
      patientName,
      patientAge,
      gender,
      procedure,
      surgeryType,
      date,
      status,
      formVersion,
      formData,    
    });

    res.status(201).json({
      message: 'Surgery created successfully',
      surgery
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
          message: 'Validation failed.',
          errors: messages
      });
    }
    console.error('Failed to create surgery:', error);
    res.status(500).json({ message: 'Failed to create surgery (Server Error)' });
  }
};

exports.getSurgeryById = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id).populate('doctor', 'fullname email');

    if (!surgery) {
      return res.status(404).json({ message: 'Surgery not found' });
    }

    res.status(200).json(surgery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch surgery' });
  }
};

exports.getDoctorsSurgeryById = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id).populate('doctor', 'fullname email');

    // FIXED: Moved up to check existence first before inspecting properties
    if (!surgery) {
      return res.status(404).json({ message: 'Surgery not found' });
    }

    // FIXED: Using safe population resolution check
    const doctorId = surgery.doctor._id ? surgery.doctor._id.toString() : surgery.doctor.toString();
    if (doctorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json(surgery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch surgery' });
  }
};

exports.updateSurgery = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id);

    if (!surgery) {
      return res.status(404).json({ message: 'Surgery not found' });
    }

    if (surgery.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedFields = [
      'patientName', 'patientAge', 'gender', 'procedure', 
      'surgeryType', 'date', 'status', 'formData', 'formVersion'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        surgery[field] = req.body[field];
      }
    });

    await surgery.save();

    res.status(200).json({
      message: 'Surgery updated successfully',
      surgery
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update surgery' });
  }
};

exports.completeSurgery = async (req, res) => {
  try {
    const surgery = await Surgery.findById(req.params.id);

    // FIXED: Checked existence BEFORE accessing properties
    if (!surgery) {
      return res.status(404).json({ message: 'Surgery not found' });
    }

    // FIXED: Fallback to regular toString context if property isn't populated
    const doctorId = surgery.doctor._id ? surgery.doctor._id.toString() : surgery.doctor.toString();
    if (doctorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    surgery.status = 'complete';
    await surgery.save();

    res.status(200).json({
      message: 'Surgery submitted successfully',
      surgery
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to complete surgery' });
  }
};

exports.getMySurgeries = async (req, res) => {
  try {
    const doctorId = req.user.id; 

    const surgeries = await Surgery.find({ doctor: doctorId })
      .sort({ createdAt: -1 })
      .select('-formData') 
      .lean();

    res.status(200).json({
      count: surgeries.length,
      data: surgeries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch surgeries' });
  }
};

exports.getSurgeriesByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const surgeries = await Surgery.find({ doctor: doctorId })
      .populate('doctor', 'doctorId email fullname specialty phone city country status')
      .sort({ createdAt: -1 })
      .select('-formData');

    if (surgeries.length === 0) {
      return res.status(200).json({ 
        message: 'No surgeries found for this doctor',
        count: 0,
        data: []
      });
    }

    const doctorInfo = surgeries[0].doctor;

    const surgeriesWithoutDoctor = surgeries.map(surgery => {
      const surgeryObj = surgery.toObject();
      delete surgeryObj.doctor;
      return surgeryObj;
    });

    res.status(200).json({
      count: surgeries.length,
      doctor: doctorInfo, 
      data: surgeriesWithoutDoctor 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch surgeries' });
  }
};