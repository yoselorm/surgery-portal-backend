const Surgery = require("../models/surgerModel");


exports.getAllSurgeries = async (req, res) => {
  try {
    const {
      status,
      doctor,
      procedure,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (procedure) query.procedure = procedure;

    const surgeries = await Surgery.find(query)
      .populate('doctor', 'fullname email')
      .select('-formData')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Surgery.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
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
        doctor: req.user.id, //Reminder for sel:Getting this from auth middleware
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
    
    // Handle other server errors (500 Internal Server Error)
    console.error('Failed to create surgery:', error);
    res.status(500).json({ 
        message: 'Failed to create surgery (Server Error)' 
    });
    }
  };
  

  exports.getSurgeryById = async (req, res) => {
    try {
      const surgery = await Surgery.findById(req.params.id)
        .populate('doctor', 'fullname email');

        // if (surgery.doctor.toString() !== req.user.id) {
        //     return res.status(403).json({ message: 'Not authorized' });
        //   }
  
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
      const surgery = await Surgery.findById(req.params.id)
        .populate('doctor', 'fullname email');

        if (surgery.doctor._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
          }
  
      if (!surgery) {
        return res.status(404).json({ message: 'Surgery not found' });
      }
  
      res.status(200).json(surgery);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch surgery' });
    }
  };

//   exports.updateSurgery = async (req, res) => {
//     try {
//       const surgery = await Surgery.findById(req.params.id);
  
//       if (!surgery) {
//         return res.status(404).json({ message: 'Surgery not found' });
//       }
  
//       // Prevent edits after completion (optional but recommended)
//       if (surgery.status === 'complete') {
//         return res.status(403).json({
//           message: 'Completed surgeries cannot be edited'
//         });
//       }
  
//       Object.assign(surgery, req.body);
//       await surgery.save();
  
//       res.status(200).json({
//         message: 'Surgery saved',
//         surgery
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Failed to save surgery' });
//     }
//   };

/**
 * PUT /api/surgeries/:id
 */
exports.updateSurgery = async (req, res) => {
    try {
      const surgery = await Surgery.findById(req.params.id);
  
      if (!surgery) {
        return res.status(404).json({ message: 'Surgery not found' });
      }
  
      // Optional: permission check
      if (surgery.doctor.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
  
      const allowedFields = [
        'patientName',
        'patientAge',
        'gender',
        'procedure',
        'surgeryType',
        'date',
        'status',
        'formData',
        'formVersion'
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
  
      if (surgery.doctor._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (!surgery) {
        return res.status(404).json({ message: 'Surgery not found' });
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
        .select('-formData') // optional: exclude heavy data for lists
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
        return res.json({ 
          message: 'No surgeries found for this doctor' 
        });
      }
  
      // Extract doctor info from first surgery (since it's the same for all)
      const doctorInfo = surgeries[0].doctor;
  
      // Remove doctor field from each surgery to reduce payload size
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