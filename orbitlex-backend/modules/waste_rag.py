import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from data.waste_policy_docs import WASTE_POLICY_DOCS


class WasteRAGSystem:
    """
    In-memory FAISS RAG store for waste domain guidance.

    No database: documents are loaded from in-repo open text at startup and
    indexed in memory.
    """

    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.documents = list(WASTE_POLICY_DOCS.values())
        self.chunks: list[str] = []

        self._prepare_chunks()
        self.dimension = 384
        self.index = faiss.IndexFlatL2(self.dimension)
        self._index_chunks()

    def _prepare_chunks(self) -> None:
        # Approximate "token" chunking by character length.
        # This keeps retrieval focused and avoids huge paragraphs dominating similarity search.
        chunk_size = 1200
        overlap = 200

        for doc in self.documents:
            text = (doc or "").strip()
            if not text:
                continue

            start = 0
            while start < len(text):
                end = min(len(text), start + chunk_size)
                chunk = text[start:end].strip()
                if chunk:
                    self.chunks.append(chunk)
                if end >= len(text):
                    break
                start += chunk_size - overlap

        # Defensive: avoid empty index.
        if not self.chunks:
            self.chunks = ["Waste policy guidance unavailable."]

    def _index_chunks(self) -> None:
        embeddings = self.model.encode(self.chunks)
        self.index.add(np.array(embeddings).astype("float32"))

    def retrieve(self, query: str, k: int = 5) -> list[str]:
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_embedding).astype("float32"), k)
        result_chunks: list[str] = []
        for idx in indices[0]:
            if 0 <= idx < len(self.chunks):
                result_chunks.append(self.chunks[idx])
        return result_chunks


waste_rag_system = WasteRAGSystem()

