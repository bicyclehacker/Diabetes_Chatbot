// controllers/prescriptionController.js
const { generateResponseWithImage } = require('../services/ai.service');
const Medication = require('../models/Medication');

exports.uploadPrescription = async (req, res) => {
    let savedMeds = []; // Initialize scope

    try {
        console.log('POST Prescription API (Gemini Vision)');

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        console.log('File received:', req.file.originalname);

        // Define the prompt for the image
        const prompt = `
            Analyze the uploaded image of a medical prescription.
            
            *** GOAL ***
            Extract medication details into a strict JSON structure.
            
            *** CONTEXT ***
            1. This is a raw image. Handwriting may be difficult to read. Use your best judgment to correct spelling (e.g., "Mctformin" -> "Metformin").
            2. Translate medical abbreviations (bid, tid, po, ac) into simple English instructions in the "notes".

            *** REQUIRED JSON STRUCTURE ***
            Return ONLY a raw JSON object (no markdown formatting) with this schema:
            {
              "patientName": "string or null",
              "doctorName": "string or null",
              "medications": [
                {
                  "name": "string (Corrected Drug Name)",
                  "dosage": "string (e.g., 500mg)",
                  "times": ["HH:mm", "HH:mm"] (24h format inferred from frequency),
                  "frequency": "Once Daily" | "Twice Daily" | "Three Times Daily" | "As Needed",
                  "notes": "string (Translate instructions like 'take with food' or 'before bed')"
                }
              ]
            }

            *** FREQUENCY RULES ***
            - "bid" / twice a day -> "Twice Daily"
            - "tid" / three times a day -> "Three Times Daily"
            - "qid" / four times a day -> "As Needed" (and add "Take 4 times a day" to notes)
        `;

        console.log('Sending image to Gemini 1.5 Flash...');

        // Call the updated AI service with the buffer directly
        // req.file.buffer is the raw image data
        // req.file.mimetype ensures we tell Gemini if it's png/jpeg/webp
        const aiAnalysisString = await generateResponseWithImage(
            prompt,
            req.file.buffer,
            req.file.mimetype
        );

        console.log('--- AI Analysis String ---');
        console.log(aiAnalysisString);

        // --- Parse Logic (Same as before) ---
        let aiData = null;

        try {
            // Sanitize string just in case Gemini wraps it in markdown
            const cleanJsonString = aiAnalysisString
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            aiData = JSON.parse(cleanJsonString);

            if (aiData && aiData.medications && aiData.medications.length > 0) {
                console.log(`AI found ${aiData.medications.length} medications. Saving...`);

                const savePromises = aiData.medications.map(med => {
                    // Basic validation
                    if (!med.name) return Promise.resolve(null);

                    const newMedication = new Medication({
                        user: req.user.id,
                        name: med.name,
                        dosage: med.dosage || 'TBD',
                        frequency: med.frequency || 'As Needed',
                        times: med.times || [],
                        notes: med.notes || 'Auto-generated from prescription scan.'
                    });

                    return newMedication.save();
                });

                const results = await Promise.all(savePromises);
                savedMeds = results.filter(med => med !== null);
            }
        } catch (jsonError) {
            console.error('Failed to parse AI JSON response:', jsonError);
            // Handle error gracefully, perhaps return raw text to user to manually fix
            return res.status(422).json({
                message: 'Could not read prescription format.',
                rawResponse: aiAnalysisString
            });
        }

        res.status(200).json({
            message: `File processed! ${savedMeds.length} new medications added.`,
            file: req.file.originalname,
            patient: aiData?.patientName,
            doctor: aiData?.doctorName,
            savedMedications: savedMeds
        });

    } catch (error) {
        console.error('POST error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};