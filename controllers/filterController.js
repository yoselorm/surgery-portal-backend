const express = require('express');
const surgerModel = require('../models/surgerModel');



exports.filterFunction = async (req, res) => {
  try {
    const { procedure, filters } = req.body;
    let query = {};

    // If specific procedure is selected, filter by it
    if (procedure && procedure !== 'all') {
      // Map procedure IDs to actual procedure names in database
      const procedureMap = {
        'biolitec-lhp': 'Biolitec Laser LHP',
        'cardiac': 'Cardiac Surgery',
        'neurosurgery': 'Neurosurgery',
        'orthopedic': 'Orthopedic Surgery',
        'general': 'General Surgery',
        'ent': 'ENT Surgery'
      };
      
      query.procedure = procedureMap[procedure] || procedure;
    }

    // Common Filters
    // Date Range
    if (filters.dateRange?.start || filters.dateRange?.end) {
      query.date = {};
      if (filters.dateRange.start) {
        query.date.$gte = new Date(filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        query.date.$lte = new Date(filters.dateRange.end);
      }
    }

    // Patient Age
    if (filters.patientAge?.min || filters.patientAge?.max) {
      query.patientAge = {};
      if (filters.patientAge.min) {
        query.patientAge.$gte = parseInt(filters.patientAge.min);
      }
      if (filters.patientAge.max) {
        query.patientAge.$lte = parseInt(filters.patientAge.max);
      }
    }

    // Gender
    if (filters.gender && filters.gender !== 'all') {
      query.gender = filters.gender;
    }

    // Status
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    // Procedure-Specific Filters (for Biolitec LHP)
    if (filters.procedureSpecific && Object.keys(filters.procedureSpecific).length > 0) {
      const ps = filters.procedureSpecific;

      // Laser Wavelength
      if (ps.laserWavelength && ps.laserWavelength !== 'all') {
        query['formData.laserWavelength'] = ps.laserWavelength;
      }

      // Laser Power Range
      if (ps.laserPowerMin || ps.laserPowerMax) {
        // Need to handle this carefully as power is stored as string like "8W"
        // You may need to adjust based on your actual data format
        const powerConditions = [];
        if (ps.laserPowerMin) {
          powerConditions.push({ 'formData.laserPower': { $gte: ps.laserPowerMin + 'W' } });
        }
        if (ps.laserPowerMax) {
          powerConditions.push({ 'formData.laserPower': { $lte: ps.laserPowerMax + 'W' } });
        }
        if (powerConditions.length > 0) {
          query.$and = query.$and || [];
          query.$and.push(...powerConditions);
        }
      }

      // Follow-up Period
      if (ps.followUpPeriod && ps.followUpPeriod !== 'all') {
        const periodPath = `formData.followUp.${ps.followUpPeriod}`;
        
        if (ps.followUpCompleted && ps.followUpCompleted !== 'all') {
          query[`${periodPath}.completed`] = ps.followUpCompleted === 'true';
        } else {
          query[`${periodPath}.completed`] = { $exists: true };
        }
      }

      // VAS Score Range
      if (ps.vasScoreMin || ps.vasScoreMax) {
        const vasQuery = {};
        if (ps.vasScoreMin) vasQuery.$gte = ps.vasScoreMin;
        if (ps.vasScoreMax) vasQuery.$lte = ps.vasScoreMax;
        
        // Check in multiple follow-up periods
        query.$or = query.$or || [];
        query.$or.push(
          { 'formData.followUp.twoWeeks.vasScore': vasQuery },
          { 'formData.followUp.sixWeeks.vasScore': vasQuery },
          { 'formData.followUp.threeMonths.vasScore': vasQuery },
          { 'formData.vasScore': vasQuery }
        );
      }

      // Symptoms
      ['pain', 'itching', 'bleeding', 'soiling', 'prolapsing'].forEach(symptom => {
        const symptomKey = `symptom_${symptom}`;
        if (ps[symptomKey] && ps[symptomKey] !== 'all') {
          query.$and = query.$and || [];
          query.$and.push({
            $or: [
              { [`formData.symptoms.${symptom}`]: ps[symptomKey] },
              { [`formData.followUp.twoWeeks.symptoms.${symptom}`]: ps[symptomKey] }
            ]
          });
        }
      });

      // Diagnostics
      ['fissure', 'skinTags', 'fistula', 'cryptitis', 'analRectumProlapse', 'analStenosis'].forEach(diagnostic => {
        const diagnosticKey = `diagnostic_${diagnostic}`;
        if (ps[diagnosticKey] && ps[diagnosticKey] !== 'all') {
          const diagPath = `formData.diagnostics.${diagnostic}`;
          
          switch (ps[diagnosticKey]) {
            case 'observed':
              query[`${diagPath}.observed`] = true;
              break;
            case 'treated':
              query[`${diagPath}.treated`] = true;
              break;
            case 'both':
              query[`${diagPath}.observed`] = true;
              query[`${diagPath}.treated`] = true;
              break;
          }
        }
      });

      // Treatment Methods
      ['medication', 'sclerosation', 'infraredCoagulation', 'rubberBandLigation', 'halDghal', 'surgery'].forEach(treatment => {
        const treatmentKey = `treatment_${treatment}`;
        if (ps[treatmentKey] && ps[treatmentKey] !== 'all') {
          query[`formData.treatmentMethods.${treatment}`] = ps[treatmentKey] === 'true';
        }
      });

      // Anaesthesia
      if (ps.anaesthesia && ps.anaesthesia !== 'all') {
        query[`formData.${ps.anaesthesia}Anaesthesia`] = 'yes';
      }
    }

    // Execute Query
    const surgeries = await surgerModel.find(query)
      .populate('doctor', 'fullname email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: surgeries.length,
      data: surgeries,
      filters: filters,
      procedure: procedure
    });

  } catch (error) {
    console.error('Export filter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering surgeries for export',
      error: error.message
    });
  }
};

