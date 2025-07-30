import os
import pandas as pd
import numpy as np
import chromadb
import logging
from google import genai
from google.genai import types
from fastapi import HTTPException
from models import SimilarIssue, DuplicateDetectionResponse

logger = logging.getLogger(__name__)

class DuplicateDetector:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")

        self.client = genai.Client(api_key=self.api_key)
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = None
        self.EMBEDDING_MODEL = "gemini-embedding-001"
        self.EMBEDDING_DIMENSION = 768
        self.DUPLICATE_THRESHOLD = 0.8
        self.initialize_collection()

    def initialize_collection(self):
        """Initialize ChromaDB collection with past issues"""
        try:
            self.collection = self.chroma_client.get_collection(name="dq_issues_embeddings")
            logger.info("Collection 'dq_issues_embeddings' loaded successfully")
        except Exception as e:
            logger.info("Collection doesn't exist, creating and populating...")
            self.collection = self.chroma_client.get_or_create_collection(name="dq_issues_embeddings")
            self.load_past_issues()

    def load_past_issues(self):
        """Load past issues from CSV and store embeddings in ChromaDB"""
        try:
            # Load CSV data
            df = pd.read_csv("Data_Steward_New_Data.csv", encoding='ISO-8859-1')
            id_column = "Ticket ID"
            desc_column = "Description of DQ Issue"
            rca_category_column = "RCA Category"
            rca_details_column = "RCA Details"

            # Drop rows with any of the required fields missing
            df = df[[id_column, desc_column, rca_category_column, rca_details_column]].dropna().drop_duplicates()
            past_issues_data = [(row[id_column], row[desc_column], row[rca_category_column], row[rca_details_column])
                                for index, row in df.iterrows()]

            past_issue_ids = [str(issue[0]) for issue in past_issues_data]
            past_issue_descriptions = [issue[1] for issue in past_issues_data]

            logger.info(f"Generating embeddings for {len(past_issue_descriptions)} past issues...")
            past_embeddings_response = self.client.models.embed_content(
                model=self.EMBEDDING_MODEL,
                contents=past_issue_descriptions,
                config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
            )
            past_embeddings_list = [e.values for e in past_embeddings_response.embeddings]

            # Add to ChromaDB with RCA metadata
            self.collection.add(
                embeddings=past_embeddings_list,
                documents=past_issue_descriptions,
                metadatas=[
                    {
                        "ticket_id": str(issue[0]),
                        "rca_category": issue[2],
                        "rca_details": issue[3]
                    } for issue in past_issues_data
                ],
                ids=past_issue_ids
            )

            logger.info(f"Added {len(past_issue_ids)} embeddings to ChromaDB")

        except FileNotFoundError:
            logger.warning("Data_Steward_New_Data.csv not found. Collection will be empty.")
        except Exception as e:
            logger.error(f"Error loading past issues: {str(e)}")

    def detect_duplicates(self, issue_id: str, issue_description: str) -> DuplicateDetectionResponse:
        """Detect duplicate issues for a given issue description"""
        try:
            logger.info(f"Generating embedding for issue: {issue_id}")
            new_issue_embedding_response = self.client.models.embed_content(
                model=self.EMBEDDING_MODEL,
                contents=[issue_description],
                config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
            )
            new_issue_embedding = np.array(new_issue_embedding_response.embeddings[0].values)

            results = self.collection.query(
                query_embeddings=new_issue_embedding.tolist(),
                n_results=3,
                include=['distances', 'documents', 'metadatas']
            )

            similar_issues = []
            is_duplicate = False

            if results['ids'][0]:
                for i in range(len(results['ids'][0])):
                    ticket_id = results['ids'][0][i]
                    description = results['documents'][0][i]
                    distance = results['distances'][0][i]
                    metadata = results['metadatas'][0][i]

                    similarity_score = 1 - distance
                    if similarity_score >= self.DUPLICATE_THRESHOLD:
                        is_duplicate = True

                    similar_issues.append(SimilarIssue(
                        ticket_id=ticket_id,
                        description=description,
                        similarity_score=similarity_score,
                        rca_category=metadata.get("rca_category", ""),
                        rca_details=metadata.get("rca_details", "")
                    ))

            return DuplicateDetectionResponse(
                new_issue_id=issue_id,
                new_issue_description=issue_description,
                similar_issues=similar_issues,
                is_duplicate=is_duplicate,
                duplicate_threshold=self.DUPLICATE_THRESHOLD
            )

        except Exception as e:
            logger.error(f"Error in duplicate detection: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error in duplicate detection: {str(e)}")

    def get_collection_count(self) -> int:
        """Get the number of embeddings in the collection"""
        try:
            return self.collection.count() if self.collection else 0
        except Exception as e:
            logger.error(f"Error getting collection count: {str(e)}")
            return 0


# import os
# import pandas as pd
# import numpy as np
# import chromadb
# import logging
# from google import genai
# from google.genai import types
# from fastapi import HTTPException
# from models import SimilarIssue, DuplicateDetectionResponse

# logger = logging.getLogger(__name__)

# class DuplicateDetector:
#     def __init__(self):
#         self.api_key = os.getenv("GEMINI_API_KEY")
#         if not self.api_key:
#             raise ValueError("GEMINI_API_KEY not found in environment variables")

#         self.client = genai.Client(api_key=self.api_key)
#         self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
#         self.collection = None
#         self.EMBEDDING_MODEL = "gemini-embedding-001"
#         self.EMBEDDING_DIMENSION = 768
#         self.DUPLICATE_THRESHOLD = 0.8
#         self.initialize_collection()

#     def initialize_collection(self):
#         """Initialize ChromaDB collection with past issues"""
#         try:
#             self.collection = self.chroma_client.get_collection(name="dq_issues_embeddings")
#             logger.info("Collection 'dq_issues_embeddings' loaded successfully")
#         except Exception as e:
#             logger.info("Collection doesn't exist, creating and populating...")
#             self.collection = self.chroma_client.get_or_create_collection(name="dq_issues_embeddings")
#             self.load_past_issues()

#     def load_past_issues(self):
#         """Load past issues from CSV and store embeddings in ChromaDB"""
#         try:
#             # Load CSV data
#             df = pd.read_csv("Data_Steward_New_Data.csv", encoding='ISO-8859-1')
#             id_column = "Ticket ID"
#             desc_column = "Description of DQ Issue"

#             df = df[[id_column, desc_column]].dropna().drop_duplicates()
#             past_issues_data = [(row[id_column], row[desc_column]) for index, row in df.iterrows()]

#             past_issue_ids = [str(issue[0]) for issue in past_issues_data]
#             past_issue_descriptions = [issue[1] for issue in past_issues_data]

#             # Generate embeddings for past issues
#             logger.info(f"Generating embeddings for {len(past_issue_descriptions)} past issues...")
#             past_embeddings_response = self.client.models.embed_content(
#                 model=self.EMBEDDING_MODEL,
#                 contents=past_issue_descriptions,
#                 config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
#             )
#             past_embeddings_list = [e.values for e in past_embeddings_response.embeddings]

#             # Add embeddings to ChromaDB
#             self.collection.add(
#                 embeddings=past_embeddings_list,
#                 documents=past_issue_descriptions,
#                 metadatas=[{"ticket_id": id} for id in past_issue_ids],
#                 ids=past_issue_ids
#             )
#             logger.info(f"Added {len(past_issue_ids)} embeddings to ChromaDB")

#         except FileNotFoundError:
#             logger.warning("Data_Steward_New_Data.csv not found. Collection will be empty.")
#         except Exception as e:
#             logger.error(f"Error loading past issues: {str(e)}")

#     def detect_duplicates(self, issue_id: str, issue_description: str) -> DuplicateDetectionResponse:
#         """Detect duplicate issues for a given issue description"""
#         try:
#             # Generate embedding for the new issue
#             logger.info(f"Generating embedding for issue: {issue_id}")
#             new_issue_embedding_response = self.client.models.embed_content(
#                 model=self.EMBEDDING_MODEL,
#                 contents=[issue_description],
#                 config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
#             )
#             new_issue_embedding = np.array(new_issue_embedding_response.embeddings[0].values)

#             # Query ChromaDB for similar issues
#             results = self.collection.query(
#                 query_embeddings=new_issue_embedding.tolist(),
#                 n_results=3,
#                 include=['distances', 'documents', 'metadatas']
#             )

#             # Process results
#             similar_issues = []
#             is_duplicate = False

#             if results['ids'][0]:  # Check if results exist
#                 for i in range(len(results['ids'][0])):
#                     ticket_id = results['ids'][0][i]
#                     description = results['documents'][0][i]
#                     distance = results['distances'][0][i]
#                     similarity_score = 1 - distance  # Convert distance to similarity

#                     similar_issues.append(SimilarIssue(
#                         ticket_id=ticket_id,
#                         description=description,
#                         similarity_score=similarity_score
#                     ))

#                     # Check if any similar issue exceeds duplicate threshold
#                     if similarity_score >= self.DUPLICATE_THRESHOLD:
#                         is_duplicate = True

#             return DuplicateDetectionResponse(
#                 new_issue_id=issue_id,
#                 new_issue_description=issue_description,
#                 similar_issues=similar_issues,
#                 is_duplicate=is_duplicate,
#                 duplicate_threshold=self.DUPLICATE_THRESHOLD
#             )

#         except Exception as e:
#             logger.error(f"Error in duplicate detection: {str(e)}")
#             raise HTTPException(status_code=500, detail=f"Error in duplicate detection: {str(e)}")

#     # def add_issue(self, issue_id: str, issue_description: str) -> str:
#     #     """Add a new issue to the knowledge base"""
#     #     try:
#     #         # Generate embedding for the new issue
#     #         embedding_response = self.client.models.embed_content(
#     #             model=self.EMBEDDING_MODEL,
#     #             contents=[issue_description],
#     #             config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY")
#     #         )
#     #         embedding = embedding_response.embeddings[0].values

#     #         # Add to ChromaDB
#     #         self.collection.add(
#     #             embeddings=[embedding],
#     #             documents=[issue_description],
#     #             metadatas=[{"ticket_id": issue_id}],
#     #             ids=[issue_id]
#     #         )

#     #         logger.info(f"Added new issue to knowledge base: {issue_id}")
#     #         return f"Issue {issue_id} added to knowledge base successfully"

#     #     except Exception as e:
#     #         logger.error(f"Error adding issue to knowledge base: {str(e)}")
#     #         raise HTTPException(status_code=500, detail=str(e))

#     def get_collection_count(self) -> int:
#         """Get the number of embeddings in the collection"""
#         try:
#             return self.collection.count() if self.collection else 0
#         except Exception as e:
#             logger.error(f"Error getting collection count: {str(e)}")
#             return 0
