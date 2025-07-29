# 🚀 AmDash: Smart Centralized Platform for Data Quality Issue Tracking

## 🎯 Problem Statement 2: Data Stewardship

In large organizations, data quality issues often slip through the cracks due to decentralized tracking and resolution processes. This leads to duplicated efforts, delayed resolutions, and a lack of visibility into recurring problems. AmDash addresses this by providing a centralized platform for managing data quality issues, from detection to resolution.

## 💡 Explanation of the Solution

AmDash is a comprehensive, AI-powered platform tailored to streamline Ambank's entire data quality issue management lifecycle. Our solution empowers data quality managers to identify, prioritize, and resolve data quality issues efficiently, ensuring a smooth user experience aiding their operational workflow while maintaning issue tracking integrity and reliability.

### ✨ Key Features:

*   📊 **Key Analytics Dashboard:** Provides powerful visualizations to identify trends and prioritize efforts.
    *   ⏰ **Instant Follow-Ups to Near-Deadline Issues:** Filters for open issues that are assigned to the data steward in-charge and sorts them by the nearest upcoming deadline, ensuring time-sensitive issues get immediate attention.  
    *   ⚖️ **Effort vs. Impact Analysis:** Maps issues on an effort (working days) vs. impact (total impacted records) matrix. Bubble color indicates priority, helping to distinguish between "Quick Wins" (high impact, low effort) and "Major Projects" (high impact, high effort).  
    *   🔍 **Root Cause Analysis (RCA) vs. Source System:** Visualizes the count of issues per source system, broken down by root cause (People, Process, System). This quickly reveals if specific systems are prone to certain types of errors.
    *   📋 **"Top 5 Most Resource-Intensive Issues" Table:** Lists the specific "Major Projects" that require the most resources, aiding in strategic planning.
*   🗂️ **Centralized Issue Kanban Board:** A unified dashboard provides a holistic view of all data issues, streamlining the tracking workflow going through different phases with an emphasis on visualization.
    *   📈 **"Progress Visualization for Resolutions"** Three different coloured progress bars that indicate the completion status for the resolutions.
    *   💡 **Intelligent Priority Suggestion:** Issues are suggested a priority score based on their potential impact and complexity. The priority score is calculated using factors like the system affected, the type of error, and the number of downstream dependencies.
    *   🤖 **AI-Powered Duplicate Detection:** Leveraging vector embedding techniques, AmDash has the ability to identify duplicate or related issue reports based on historical data, potentially identifying recurring problem patterns.
    *   📧 **Automated Reporting to Data Stewards:** With a single click, generate a concise, AI-powered summary of any data quality issue. This report includes the problem description, impact analysis, and priority level, ready to be emailed to the relevant Data Steward to streamline communication and accelerate the resolution process.


## 💻 Tech Stack Used

### Frontend
*   **Framework:** Next.js (React)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn UI, Radix UI
*   **Data Visualization:** Recharts
*   **Animations:** Framer Motion
*   **Drag and Drop:** dnd-kit

### Backend
*   **Framework:** FastAPI (Python)
*   **Language:** Python
*   **Database:** Firebase Firestore
*   **Machine Learning:**
    *   Google Generative AI
    *   scikit-learn
    *   Pandas
    *   NumPy
*   **Vector Database:** ChromaDB

### Other Tools
*   **File Uploads:** UploadThing

## 📹 Demo Video

[Link to your demo video]

## 📊 Presentation Deck

[View Presentation Deck](https://www.canva.com/design/DAGulAyw1Kk/j34BKgCvJCEtu2lhW5it1g/edit?utm_content=DAGulAyw1Kk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)