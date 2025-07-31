const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
// 1. UPDATE a path to your Firebase Service Account Key JSON file.
const serviceAccountKeyPath = './serviceAccountKeyFirebase.json';

// 2. ENSURE this path points to the 'sample_issues_20.json' file you downloaded.
const sampleDataPath = './sample-issues.v5.json';
// -------------------


// Check if service account key path is valid
if (!fs.existsSync(serviceAccountKeyPath)) {
    console.error(`Error: Service account key file not found at '${serviceAccountKeyPath}'.`);
    console.error('Please download it from your Firebase project settings and update the path in this script.');
    process.exit(1);
}

// Check if sample data file exists
if (!fs.existsSync(sampleDataPath)) {
    console.error(`Error: Sample data file not found at '${sampleDataPath}'.`);
    console.error("Please download 'sample_issues_20.json' and place it in the same directory as this script.");
    process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = require(path.resolve(serviceAccountKeyPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });


// Helper function to convert a value to a Firestore Timestamp if it's a valid date
const toTimestamp = (dateString) => {
    if (!dateString || !Date.parse(dateString)) {
        return null;
    }
    return admin.firestore.Timestamp.fromDate(new Date(dateString));
};


// Main function to populate the database
async function populateDatabase() {
  try {
    const rawData = fs.readFileSync(sampleDataPath, 'utf8');
    const { data: sampleIssues } = JSON.parse(rawData);

    if (!sampleIssues || sampleIssues.length === 0) {
        console.log("No sample issues found in the JSON file.");
        return;
    }

    console.log(`Found ${sampleIssues.length} sample issues. Starting upload to Firestore...`);

    const collectionRef = db.collection('issues');
    const batchSize = 10;

    for (let i = 0; i < sampleIssues.length; i += batchSize) {
        const batch = db.batch();
        const chunk = sampleIssues.slice(i, i + batchSize);

        for (const issue of chunk) {
            const docRef = collectionRef.doc(issue.id);

            // Create a new object with converted timestamps to avoid mutating the original
            const firestoreDoc = {
                ...issue,
                createdAt: toTimestamp(issue.createdAt),
                pickedUpAt: toTimestamp(issue.pickedUpAt),
                assignedAt: toTimestamp(issue.assignedAt),
                resolvedAt: toTimestamp(issue.resolvedAt),
                completedAt: toTimestamp(issue.completedAt),
                deadline: toTimestamp(issue.deadline),
                targetDeadline: toTimestamp(issue.targetDeadline),
            };

            batch.set(docRef, firestoreDoc);
        }

        await batch.commit();
        console.log(`Batch ${i/batchSize + 1} committed.`);
    }

    console.log(`\n✅ Successfully populated the 'issues' collection with ${sampleIssues.length} documents.`);

  } catch (error) {
    console.error('\n❌ An error occurred while populating the database:', error);
  }
}

// Run the script
populateDatabase();