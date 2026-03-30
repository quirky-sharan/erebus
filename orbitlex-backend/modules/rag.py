"""
RAG (Retrieval-Augmented Generation) module for OrbitLex.
Uses FAISS + sentence-transformers to provide policy-grounded context
to the LLM for report generation.
"""
import faiss
import numpy as np
import re
from sentence_transformers import SentenceTransformer
from data.policy_docs import IADC_POLICY, FCC_POLICY, ESA_POLICY, UN_OST_POLICY, UN_COPUOS_POLICY

# ---------------------------------------------------------------------------
# Chunking helpers
# ---------------------------------------------------------------------------

def _clean_text(text: str) -> str:
    """Remove excessive whitespace while preserving paragraph structure."""
    lines = text.strip().split('\n')
    cleaned = []
    for line in lines:
        line = line.strip()
        if line:
            cleaned.append(line)
    return '\n'.join(cleaned)


def _chunk_document(text: str, max_tokens: int = 300, overlap_tokens: int = 50) -> list[str]:
    """
    Split a document into overlapping chunks of approximately max_tokens words.
    Uses paragraph boundaries when possible for cleaner chunks.
    """
    text = _clean_text(text)
    paragraphs = re.split(r'\n{2,}', text)
    
    chunks: list[str] = []
    current_chunk_words: list[str] = []
    
    for para in paragraphs:
        para_words = para.split()
        
        if len(current_chunk_words) + len(para_words) <= max_tokens:
            current_chunk_words.extend(para_words)
        else:
            if current_chunk_words:
                chunks.append(' '.join(current_chunk_words))
                # Keep overlap
                overlap = current_chunk_words[-overlap_tokens:] if len(current_chunk_words) > overlap_tokens else current_chunk_words[:]
                current_chunk_words = overlap + para_words
            else:
                # Single paragraph exceeds max_tokens — force-split
                while len(para_words) > max_tokens:
                    chunks.append(' '.join(para_words[:max_tokens]))
                    para_words = para_words[max_tokens - overlap_tokens:]
                current_chunk_words = para_words
    
    if current_chunk_words:
        chunks.append(' '.join(current_chunk_words))
    
    # Filter empty / tiny chunks
    chunks = [c for c in chunks if len(c.split()) >= 10]
    return chunks


def _extract_keywords(text: str) -> list[str]:
    """Simple NLP keyword extraction (domain-specific terms)."""
    domain_terms = [
        'deorbit', 'debris', 'collision', 'leo', 'geo', 'meo', 'graveyard',
        'passivation', 'disposal', 'reentry', 'compliance', 'mitigation',
        'iadc', 'fcc', 'esa', 'copuos', 'ost', 'liability', 'registration',
        'conjunction', 'avoidance', 'fragmentation', 'breakup', 'casualty',
        '25-year', '5-year', 'zero debris', 'active debris removal',
        'orbital lifetime', 'post-mission', 'end-of-life', 'fuel',
        'atmosphere', 'altitude', 'inclination', 'eccentricity',
        'satellite', 'spacecraft', 'launch vehicle', 'orbital stage',
        'recyclable', 'reusable', 'segregation', 'circular', 'recycling',
        'e-waste', 'hazardous', 'sustainable', 'environmental'
    ]
    text_lower = text.lower()
    found = [term for term in domain_terms if term in text_lower]
    return found


class RAGSystem:
    """
    In-memory FAISS vector store for policy document retrieval.
    Rebuilt on startup (no persistence needed for hackathon demo).
    """

    def __init__(self):
        print("[RAG] Initializing sentence-transformers model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.dimension = 384  # Embedding dimension for all-MiniLM-L6-v2
        
        # Source documents with labels
        self.source_docs = {
            'IADC': IADC_POLICY,
            'FCC': FCC_POLICY,
            'ESA': ESA_POLICY,
            'UN_OST': UN_OST_POLICY,
            'UN_COPUOS': UN_COPUOS_POLICY,
        }
        
        self.chunks: list[str] = []
        self.chunk_sources: list[str] = []  # Track which framework each chunk belongs to
        self.index = None
        
        self._build_index()
        print(f"[RAG] Index built with {len(self.chunks)} chunks across {len(self.source_docs)} documents.")

    def _build_index(self):
        """Chunk all documents, embed, and build FAISS index."""
        all_chunks = []
        all_sources = []
        
        for source_name, doc_text in self.source_docs.items():
            doc_chunks = _chunk_document(doc_text, max_tokens=300, overlap_tokens=50)
            all_chunks.extend(doc_chunks)
            all_sources.extend([source_name] * len(doc_chunks))
        
        self.chunks = all_chunks
        self.chunk_sources = all_sources
        
        if not self.chunks:
            # Fallback: if chunking produces nothing, use raw docs
            for source_name, doc_text in self.source_docs.items():
                cleaned = _clean_text(doc_text)
                if cleaned:
                    self.chunks.append(cleaned)
                    self.chunk_sources.append(source_name)
        
        # Encode all chunks
        embeddings = self.model.encode(self.chunks, show_progress_bar=False)
        embeddings = np.array(embeddings).astype('float32')
        
        # Build FAISS flat index (exact search, sufficient for ~100 chunks)
        self.index = faiss.IndexFlatL2(self.dimension)
        self.index.add(embeddings)

    def retrieve(self, query: str, k: int = 5) -> list[str]:
        """
        Retrieve top-k relevant policy chunks for a given query.
        Returns list of chunk texts with source labels prepended.
        """
        if not self.chunks or self.index is None:
            return []
        
        # Clamp k to available chunks
        k = min(k, len(self.chunks))
        
        query_embedding = self.model.encode([query])
        query_embedding = np.array(query_embedding).astype('float32')
        
        distances, indices = self.index.search(query_embedding, k)
        
        results = []
        for idx in indices[0]:
            if 0 <= idx < len(self.chunks):
                source = self.chunk_sources[idx]
                chunk_text = self.chunks[idx]
                results.append(f"[{source}] {chunk_text}")
        
        return results

    def retrieve_by_framework(self, framework: str, query: str, k: int = 3) -> list[str]:
        """Retrieve chunks filtered to a specific framework."""
        all_results = self.retrieve(query, k=k * 3)  # Fetch more, then filter
        filtered = [r for r in all_results if framework.upper() in r[:20].upper()]
        return filtered[:k] if filtered else all_results[:k]


# ---------------------------------------------------------------------------
# Lazy singleton — only instantiate when first imported
# ---------------------------------------------------------------------------
_rag_instance = None

def get_rag_system() -> RAGSystem:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGSystem()
    return _rag_instance

# For backward compatibility with existing imports
rag_system = None

def _init_rag():
    global rag_system
    rag_system = get_rag_system()

# Auto-initialize on import (the model download only happens once)
try:
    _init_rag()
except Exception as e:
    print(f"[RAG] Warning: Failed to initialize RAG system: {e}")
    print("[RAG] RAG features will be unavailable.")
