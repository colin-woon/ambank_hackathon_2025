# Issue Tracker Duplicate Detection Setup

This guide will help you set up the FastAPI backend and Next.js frontend for your AI-powered duplicate detection system.

## Prerequisites

- Python 3.8+
- Node.js 18+
- Google Gemini API key
- Your CSV file: `Data_Steward_New_Data.csv`

## Backend Setup (FastAPI)

### 1. Create Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in your backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Prepare Data
Make sure your `Data_Steward_New_Data.csv` file is in the same directory as `main.py`. The file should have these columns:
- `Ticket ID`
- `Description of DQ Issue`

### 5. Run the FastAPI Server
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Frontend Setup (Next.js)

### 1. Install Frontend Dependencies
In your Next.js project directory:
```bash
npm install
# or
yarn install
```

### 2. Run the Next.js Development Server
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at: http://localhost:3000

## API Endpoints

### Health Check
- **GET** `/` - Basic health check
- **GET** `/health` - Detailed health check with database info

### Duplicate Detection
- **POST** `/detect-duplicates` - Detect duplicates for an issue
  ```json
  {
    "id": "ISSUE-001",
    "description": "Issue description here"
  }
  ```

### Knowledge Base Management
- **POST** `/add-issue` - Add new issue to knowledge base
  ```json
  {
    "id": "ISSUE-001",
    "description": "Issue description here"
  }
  ```


## Testing the Integration

1. **Start the backend server** (Python/FastAPI)
2. **Start the frontend server** (Next.js)
3. **Navigate to** http://localhost:3000
4. **Enter a test issue**:
   - Issue ID: `TEST-001`
   - Description: `Multiple records found sharing the same identification number`
5. **Click "Detect Duplicates"** to see the AI analysis

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the FastAPI server is running and CORS is configured for `http://localhost:3000`

2. **Gemini API Errors**: Verify your API key is correct in the `.env` file

3. **CSV File Not Found**: Ensure `Data_Steward_New_Data.csv` is in the backend directory

4. **ChromaDB Issues**: Delete the `chroma_db` folder and restart to recreate the database

5. **Port Conflicts**:
   - Backend default: 8000
   - Frontend default: 3000
   - Change ports in the respective configuration files if needed

### Debugging Tips

- Check the FastAPI logs in the terminal for backend errors
- Use the browser's developer tools to inspect network requests
- Visit http://localhost:8000/docs for interactive API documentation
- Test API endpoints directly using the FastAPI docs interface

## Production Deployment

For production deployment, consider:

### Backend
- Use a production WSGI server like Gunicorn
- Set up proper environment variable management
- Configure database persistence
- Implement proper logging and monitoring
- Use a reverse proxy (nginx)
- Set up SSL certificates

### Frontend
- Build the production version: `npm run build`
- Deploy to platforms like Vercel, Netlify, or your own server
- Update the API URL to point to your production backend
- Configure proper error handling and monitoring

## API Response Examples

### Successful Duplicate Detection
```json
{
  "new_issue_id": "ISSUE-001",
  "new_issue_description": "Multiple records found sharing the same identification number",
  "similar_issues": [
    {
      "ticket_id": "DQ-2021-001",
      "description": "Duplicate customer records with same ID causing data inconsistency",
      "similarity_score": 0.92
    },
    {
      "ticket_id": "DQ-2021-045",
      "description": "Customer profile duplication issue in the system",
      "similarity_score": 0.78
    }
  ],
  "is_duplicate": true,
  "duplicate_threshold": 0.8
}
```

### No Duplicates Found
```json
{
  "new_issue_id": "ISSUE-002",
  "new_issue_description": "Database connection timeout during peak hours",
  "similar_issues": [
    {
      "ticket_id": "PERF-2021-003",
      "description": "System performance degradation during high load",
      "similarity_score": 0.45
    }
  ],
  "is_duplicate": false,
  "duplicate_threshold": 0.8
}
```

## Configuration Options

### Duplicate Detection Threshold
You can adjust the similarity threshold for duplicate detection by modifying the `DUPLICATE_THRESHOLD` variable in `main.py`:

```python
DUPLICATE_THRESHOLD = 0.8  # 80% similarity threshold
```

### Number of Similar Issues Returned
Modify the `n_results` parameter in the ChromaDB query:

```python
results = collection.query(
    query_embeddings=new_issue_embedding.tolist(),
    n_results=5,  # Return top 5 instead of 3
    include=['distances', 'documents', 'metadatas']
)
```

### Embedding Model
You can change the embedding model used:

```python
EMBEDDING_MODEL = "gemini-embedding-001"  # Current model
# Or use other available models
```

## Monitoring and Logging

The application includes comprehensive logging. Check logs for:
- API request/response details
- Embedding generation status
- ChromaDB operations
- Error tracking

