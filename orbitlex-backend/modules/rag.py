import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from data.policy_docs import IADC_POLICY, FCC_POLICY, ESA_POLICY, UN_OST_POLICY, UN_COPUOS_POLICY
import os

class RAGSystem:
    def __init__(self):
        # Using a small, fast model for the hackathon
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.documents = [IADC_POLICY, FCC_POLICY, ESA_POLICY, UN_OST_POLICY, UN_COPUOS_POLICY]
        self.chunks = []
        self._prepare_chunks()
        
        # Build FAISS index
        self.dimension = 384 # Dim of all-MiniLM-L6-v2
        self.index = faiss.IndexFlatL2(self.dimension)
        self._index_chunks()

    def _prepare_chunks(self):
        # Simple chunking for demo
        for doc in self.documents:
            # Chunk by double newline or specific length
            doc_chunks = doc.split('\n\n')
            self.chunks.extend(doc_chunks)

    def _index_chunks(self):
        embeddings = self.model.encode(self.chunks)
        self.index.add(np.array(embeddings).astype('float32'))

    def retrieve(self, query: str, k: int = 3) -> list[str]:
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_embedding).astype('float32'), k)
        
        result_chunks = []
        for idx in indices[0]:
            if idx < len(self.chunks):
                result_chunks.append(self.chunks[idx])
        return result_chunks

# Global RAG instance
rag_system = RAGSystem()
