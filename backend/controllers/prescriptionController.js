
const { createWorker } = require('tesseract.js')

const { generateAIText } = require('../services/ai.service')
const Medication = require('../models/Medication');

exports.uploadPrescription = async (req, res) => {
    try {
        console.log('POST Prescription API');


        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' })
        }

        console.log('File received:', req.file.originalname);
        console.log('Starting OCR process...');

        // OCR Logic

        const worker = await createWorker('eng')

        // Pass the image buffer (from multer) to Tesseract
        // req.file.buffer is available because you use multer.memoryStorage()
        const { data: { text } } = await worker.recognize(req.file.buffer);

        console.log('Extracted Text:');
        console.log(text);

        // Terminate the worker to free up resources
        await worker.terminate();


        //AI worker to parse json

        let aiData = null;
        let savedMedication = []
        let extractedText = text

        const prompt = `
            Analyze the following prescription text.

            *** IMPORTANT CONTEXT ***
            1.  **OCR Errors:** The text comes from a raw OCR scan and likely contains spelling errors (e.g., "Mctformin", "dosge", "takc"). You MUST correct these to the most logical medication name, dosage, or instruction.
            2.  **Medical Jargon:** The text may use medical shorthand (e.g., "bid", "ac", "po", "qid"). You MUST translate this into simple, user-friendly language.

            Return a structured JSON object with these keys:
            1. "medications": An array of objects.
            2. "patientName": The full name of the patient (correct any OCR misspellings), or null.
            3. "doctorName": The full name of the doctor (correct any OCR misspellings), or null.

            Each object in the "medications" array MUST have the following keys:
            - "name": The corrected, full medication name (e.g., "Metformin").
            - "dosage": The corrected dosage string (e.g., "500mg").
            - "times": An array of strings for recommended times (e.g., ["08:00 AM", "08:00 PM"]). If no time is given, provide logical defaults based on frequency. 
            - "notes": Any extra notes, or null.
            - "frequency": You MUST map this to one of the following exact strings:
                * "Once Daily"
                * "Twice Daily"
                * "Three Times Daily"
                * "As Needed"

            *** FREQUENCY & NOTES RULE (VERY IMPORTANT) ***
            -   If the prescription says "bid" or "twice a day", set "frequency" to "Twice Daily".
            -   If the prescription says "tid" or "three times a day", set "frequency" to "Three Times Daily".
            -   If the prescription says "qid", "four times a day", "every 6 hours", or any other frequency NOT in the list, you MUST:
                1.  Set the "frequency" key to "As Needed".
                2.  Put the FULL, TRANSLATED, user-friendly instruction (e.g., "Take one pill four times a day with food") into the "notes" key.
            -   ALWAYS add translated jargon to the notes. (e.g., if you see 'ac', add "Take before meals." to the notes).

            Prescription Text:
            """
            ${extractedText}
            """
        `;

        if (extractedText) {
            const aiAnalysisString = await generateAIText(prompt);
            console.log('--- AI Analysis String ---');
            console.log(aiAnalysisString);

            try {
                const cleanJsonString = aiAnalysisString
                    .replace(/```json/g, '')
                    .replace(/```/g, '');

                aiData = JSON.parse(cleanJsonString);

                if (aiData && aiData.medications && aiData.medications.length > 0) {
                    console.log(`AI found ${aiData.medications.length} medications. Saving...`);

                    const savePromises = aiData.medications.map(med => {
                        if (!med.name || !med.dosage || !med.frequency || !med.times) {
                            console.warn('Skipping med with missing data:', med.name);
                            return Promise.resolve(null);
                        }

                        const newMedication = new Medication({
                            user: req.user.id,
                            name: med.name,
                            dosage: med.dosage,
                            frequency: med.frequency,
                            times: med.times,
                            notes: med.notes || 'Auto-generated from prescription.'
                        });

                        return newMedication.save();
                    });

                    const results = await Promise.all(savePromises);
                    savedMeds = results.filter(med => med !== null);

                }
            } catch (jsonError) {
                console.error('Failed to parse AI JSON response:', jsonError);
                aiData = { error: 'Failed to parse AI response', raw: aiAnalysisString };
            }
        }
        else {
            console.log('Skipping AI analysis (not enough text).');
        }

        res.status(200).json({
            message: `File processed! ${savedMeds.length} new medications added.`,
            file: req.file.originalname,
            extractedText: extractedText,
            aiAnalysis: aiData, // Send the parsed JSON object
            savedMedications: savedMeds // Send the newly created documents
        });
    } catch (error) {
        console.error('POST error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
