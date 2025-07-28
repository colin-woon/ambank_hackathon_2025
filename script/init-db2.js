const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKeyFirebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Path to your sample data
const sampleDataPath = './sample_issues.json';

// Function to add a single issue to Firestore
async function addIssue(issueData) {
  try {
    const issueRef = db.collection('issues').doc(issueData.id);

    // Convert date strings to Firestore Timestamps
    const firestoreIssueData = {
      ...issueData,
      createdAt: issueData.createdAt ? admin.firestore.Timestamp.fromDate(new Date(issueData.createdAt)) : null,
      pickedUpAt: issueData.pickedUpAt ? admin.firestore.Timestamp.fromDate(new Date(issueData.pickedUpAt)) : null,
      assignedAt: issueData.assignedAt ? admin.firestore.Timestamp.fromDate(new Date(issueData.assignedAt)) : null,
      resolvedAt: issueData.resolvedAt ? admin.firestore.Timestamp.fromDate(new Date(issueData.resolvedAt)) : null,
      completedAt: issueData.completedAt ? admin.firestore.Timestamp.fromDate(new Date(issueData.completedAt)) : null,
      deadline: issueData.deadline ? admin.firestore.Timestamp.fromDate(new Date(issueData.deadline)) : null,
      targetDeadline: issueData.targetDeadline ? admin.firestore.Timestamp.fromDate(new Date(issueData.targetDeadline)) : null,
    };

    await issueRef.set(firestoreIssueData);
    console.log(`Successfully added issue with ID: ${issueData.id}`);
  } catch (error) {
    console.error(`Error adding issue with ID: ${issueData.id}`, error);
  }
}

// Function to read sample data and populate Firestore
async function populateDatabase() {
  try {
    const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
    console.log(`Found ${sampleData.length} sample issues to add.`);

    for (const issue of sampleData) {
      await addIssue(issue);
    }

    console.log('Database population complete!');
  } catch (error) {
    console.error('Error populating the database:', error);
  }
}

// Run the population script
populateDatabase();