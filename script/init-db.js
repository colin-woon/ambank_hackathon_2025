// Import the necessary Firebase Admin SDK modules
const admin = require('firebase-admin');

// Import your service account key
// Make sure the path to this file is correct
const serviceAccount = require('./serviceAccountKeyFirebase.json');

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a reference to the Firestore database
const db = admin.firestore();

// --- Main function to add data ---
async function initializeDatabase() {
  console.log('Starting database initialization...');

  // Define a collection reference. Let's call it 'issues'.
  const issuesCollection = db.collection('issues');

  // Create a sample issue object based on your schema
  const sampleIssue = {
    // --- Section 1: Core Details ---
    ticketTitle: "Initial Server Room Temperature Check",
    description: "The main server room feels warmer than usual. Please perform a temperature and humidity check.",
    priority: "Medium",
    mediaAttachments: [], // No attachments for this initial issue

    // --- Requester & Source Info ---
    requesterName: "Admin Script",
    requesterContact: "N/A",
    requesterDepartment: "IT Operations",
    requesterUnit: "Infrastructure",
    sourceSystem: "Manual Script",
    impactedArea: "Data Center",

    // --- Status & Assignment ---
    status: "new",
    createdByUid: "system-init", // A special UID for system-generated tickets
    dqPicUid: null, // Not yet assigned
    itPicUid: "it-ops-lead-uid", // Pre-assign to the IT Ops lead

    // --- Timestamps ---
    createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp
    deadline: new admin.firestore.Timestamp(Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), 0), // Set deadline 7 days from now

    // --- Section 2: Key Issue Classification ---
    dqIssueCategory: null,
    problemCategory: "Infrastructure",
    isRecurring: false,

    // --- Section 3: Resolution Summary & Metrics ---
    rcaCategory: null,
    resolutionCategory: null,
    reportedRecordTotal: 0,
    impactedRecordTotal: 0,
    cleansedRecordTotal: 0,

    // --- AI Co-Pilot Generated Fields ---
    aiSuggestions: {
      impactScore: 5,
      complexityScore: 3,
      totalScore: 8,
      suggestedPriority: "Medium"
    }
  };

  try {
    // Add the new issue document to the 'issues' collection
    const customId = "ticket-001";
    await issuesCollection.doc(customId).set(sampleIssue);
    console.log(`✅ Successfully created initial issue with ID: ${customId}`);
  } catch (error) {
    console.error("❌ Error adding document: ", error);
  }
}

// Run the initialization function
initializeDatabase();
