import os
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import (
    TextLoader, 
    PyPDFLoader, 
    Docx2txtLoader, 
    UnstructuredMarkdownLoader
)
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document

from app.config import (
    VECTOR_DB_PATH, 
    EMBEDDING_MODEL,
    NUM_DOCS_TO_RETRIEVE,
    SIMILARITY_THRESHOLD,
    DOCUMENT_CHUNK_SIZE,
    DOCUMENT_CHUNK_OVERLAP
)

# Configure logger
logger = logging.getLogger(__name__)

class KnowledgeBase:
    """Service for handling document storage, retrieval and RAG functionality"""
    
    def __init__(self):
        """Initialize the knowledge base with vector store and embeddings"""
        try:
            # Initialize embeddings
            self.embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
            
            # Check if vector store exists and load it
            if os.path.exists(VECTOR_DB_PATH) and os.listdir(VECTOR_DB_PATH):
                self.vectorstore = Chroma(
                    persist_directory=VECTOR_DB_PATH,
                    embedding_function=self.embeddings
                )
                logger.info(f"Loaded existing vector store from {VECTOR_DB_PATH}")
            else:
                # Create a new vector store if it doesn't exist
                self.vectorstore = Chroma(
                    persist_directory=VECTOR_DB_PATH,
                    embedding_function=self.embeddings
                )
                logger.info(f"Created new vector store at {VECTOR_DB_PATH}")
                
            # Initialize text splitter for document chunking
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=DOCUMENT_CHUNK_SIZE,
                chunk_overlap=DOCUMENT_CHUNK_OVERLAP,
                length_function=len,
            )
            
            logger.info("Knowledge base service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize knowledge base: {str(e)}")
            raise
    
    def _get_loader_for_file(self, file_path: Path) -> Any:
        """
        Get the appropriate document loader based on file extension
        
        Args:
            file_path: Path to the document file
            
        Returns:
            Document loader instance
        """
        file_extension = file_path.suffix.lower()
        
        if file_extension == '.txt':
            return TextLoader(str(file_path))
        elif file_extension == '.pdf':
            return PyPDFLoader(str(file_path))
        elif file_extension in ['.docx', '.doc']:
            return Docx2txtLoader(str(file_path))
        elif file_extension in ['.md', '.markdown']:
            return UnstructuredMarkdownLoader(str(file_path))
        else:
            # Default to text loader
            return TextLoader(str(file_path))
    
    async def ingest_document(self, file_path: Path, metadata: Optional[Dict[str, Any]] = None) -> int:
        """
        Ingest a document into the knowledge base
        
        Args:
            file_path: Path to the document file
            metadata: Optional metadata for the document
            
        Returns:
            Number of chunks added to the vector store
        """
        try:
            if not file_path.exists():
                logger.error(f"File not found: {file_path}")
                return 0
                
            # Get appropriate loader
            loader = self._get_loader_for_file(file_path)
            
            # Load document
            documents = loader.load()
            
            # Add file metadata if provided
            if metadata:
                for doc in documents:
                    doc.metadata.update(metadata)
            
            # Ensure source is in metadata
            for doc in documents:
                if "source" not in doc.metadata:
                    doc.metadata["source"] = str(file_path)
            
            # Split documents into chunks
            chunks = self.text_splitter.split_documents(documents)
            
            if not chunks:
                logger.warning(f"No chunks created from document: {file_path}")
                return 0
            
            # Add chunks to vector store
            self.vectorstore.add_documents(chunks)
            self.vectorstore.persist()
            
            logger.info(f"Ingested {len(chunks)} chunks from {file_path}")
            return len(chunks)
            
        except Exception as e:
            logger.error(f"Error ingesting document {file_path}: {str(e)}")
            return 0
    
    async def ingest_directory(self, directory_path: Path) -> int:
        """
        Recursively ingest all documents in a directory
        
        Args:
            directory_path: Path to the directory
            
        Returns:
            Total number of chunks added to the vector store
        """
        if not directory_path.exists() or not directory_path.is_dir():
            logger.error(f"Directory not found: {directory_path}")
            return 0
            
        total_chunks = 0
        
        # Walk through directory recursively
        for root, _, files in os.walk(directory_path):
            root_path = Path(root)
            
            # Process each file
            for file in files:
                file_path = root_path / file
                
                # Skip hidden files and non-document files
                if file.startswith('.'):
                    continue
                    
                # Extract relative path for metadata
                rel_path = file_path.relative_to(directory_path)
                category = rel_path.parts[0] if len(rel_path.parts) > 1 else "general"
                
                # Create metadata
                metadata = {
                    "source": str(file_path),
                    "filename": file,
                    "category": category
                }
                
                # Ingest document
                chunks_added = await self.ingest_document(file_path, metadata)
                total_chunks += chunks_added
        
        logger.info(f"Total chunks added from directory {directory_path}: {total_chunks}")
        return total_chunks
    
    async def retrieve_relevant_documents(self, query: str) -> List[Document]:
        """
        Retrieve relevant documents for a given query
        
        Args:
            query: User query
            
        Returns:
            List of relevant documents
        """
        try:
            # Perform similarity search with threshold
            docs = self.vectorstore.similarity_search_with_score(
                query=query,
                k=NUM_DOCS_TO_RETRIEVE
            )
            
            # Filter based on similarity score threshold
            relevant_docs = []
            for doc, score in docs:
                # Note: Chroma returns cosine distance, so we need to convert to similarity
                # Cosine similarity = 1 - cosine distance
                similarity = 1 - score
                if similarity >= SIMILARITY_THRESHOLD:
                    relevant_docs.append(doc)
            
            logger.info(f"Retrieved {len(relevant_docs)} relevant documents for query: {query}")
            return relevant_docs
            
        except Exception as e:
            logger.error(f"Error retrieving documents: {str(e)}")
            return []
    
    def get_document_count(self) -> int:
        """
        Get the total number of documents in the knowledge base
        
        Returns:
            Number of documents
        """
        try:
            # This is an approximation as it counts chunks, not original documents
            return len(self.vectorstore.get())
        except Exception as e:
            logger.error(f"Error getting document count: {str(e)}")
            return 0