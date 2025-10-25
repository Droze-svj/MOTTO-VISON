import concurrent.futures
from typing import List, Dict, Any, Optional
import time
from collections import OrderedDict
import threading
from datetime import datetime, timedelta
import re
from spellchecker import SpellChecker
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import wordnet
import logging

logger = logging.getLogger(__name__)

class TranslationOptimizer:
    def __init__(self, max_workers: int = 4, cache_size: int = 1000, cache_ttl: int = 3600):
        self.max_workers = max_workers
        self.cache = OrderedDict()
        self.cache_size = cache_size
        self.cache_ttl = cache_ttl
        self.cache_lock = threading.Lock()
        self.spell_checker = SpellChecker()
        
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')

    def parallel_translate(self, texts: List[str], translate_func, target_lang: str, 
                         source_lang: str = 'auto') -> List[Dict[str, Any]]:
        """Translate multiple texts in parallel."""
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_text = {
                executor.submit(translate_func, text, target_lang, source_lang): text 
                for text in texts
            }
            
            for future in concurrent.futures.as_completed(future_to_text):
                text = future_to_text[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    logger.error(f"Translation failed for text '{text}': {str(e)}")
                    results.append({
                        "success": False,
                        "error": str(e),
                        "original_text": text
                    })
        
        return results

    def get_cached_translation(self, key: str) -> Optional[str]:
        """Get translation from cache with TTL check."""
        with self.cache_lock:
            if key in self.cache:
                timestamp, translation = self.cache[key]
                if datetime.now() - timestamp < timedelta(seconds=self.cache_ttl):
                    # Move to end (most recently used)
                    self.cache.move_to_end(key)
                    return translation
                else:
                    # Remove expired entry
                    del self.cache[key]
        return None

    def cache_translation(self, key: str, translation: str) -> None:
        """Cache translation with TTL."""
        with self.cache_lock:
            if len(self.cache) >= self.cache_size:
                # Remove oldest entry
                self.cache.popitem(last=False)
            self.cache[key] = (datetime.now(), translation)

    def check_spelling(self, text: str) -> Dict[str, Any]:
        """Check spelling in text."""
        words = word_tokenize(text)
        misspelled = self.spell_checker.unknown(words)
        suggestions = {word: list(self.spell_checker.candidates(word)) for word in misspelled}
        
        return {
            "has_errors": len(misspelled) > 0,
            "misspelled_words": list(misspelled),
            "suggestions": suggestions
        }

    def validate_grammar(self, text: str) -> Dict[str, Any]:
        """Basic grammar validation."""
        # Tokenize text
        tokens = word_tokenize(text)
        
        # Check for basic grammar patterns
        issues = []
        
        # Check sentence capitalization
        sentences = nltk.sent_tokenize(text)
        for i, sentence in enumerate(sentences):
            if sentence and not sentence[0].isupper():
                issues.append(f"Sentence {i+1} should start with a capital letter")
        
        # Check for repeated words
        for i in range(len(tokens)-1):
            if tokens[i].lower() == tokens[i+1].lower():
                issues.append(f"Repeated word: '{tokens[i]}'")
        
        return {
            "has_issues": len(issues) > 0,
            "issues": issues
        }

    def get_synonyms(self, word: str) -> List[str]:
        """Get synonyms for a word."""
        synonyms = []
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                if lemma.name() != word:
                    synonyms.append(lemma.name())
        return list(set(synonyms))

    def preprocess_text(self, text: str) -> str:
        """Preprocess text for translation."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Fix common punctuation issues
        text = re.sub(r'\s+([.,!?])', r'\1', text)
        
        return text

    def postprocess_translation(self, text: str) -> str:
        """Postprocess translated text."""
        # Fix common translation artifacts
        text = re.sub(r'\s+([.,!?])', r'\1', text)
        text = re.sub(r'([.,!?])\s*', r'\1 ', text)
        
        return text.strip()

    def calculate_quality_score(self, original: str, translated: str) -> float:
        """Calculate translation quality score."""
        score = 1.0
        
        # Check if translation is empty
        if not translated:
            return 0.0
        
        # Check length ratio
        length_ratio = len(translated) / len(original)
        if length_ratio < 0.5 or length_ratio > 2.0:
            score *= 0.8
        
        # Check for common translation artifacts
        if re.search(r'\[.*?\]|\(.*?\)', translated):
            score *= 0.9
        
        # Check for proper punctuation
        if not any(c in translated for c in '.!?'):
            score *= 0.9
        
        return score

    def get_translation_suggestions(self, text: str, target_lang: str) -> List[str]:
        """Get alternative translation suggestions."""
        # This is a placeholder for actual translation suggestions
        # In a real implementation, this would use a more sophisticated approach
        return [
            f"Alternative 1 for: {text}",
            f"Alternative 2 for: {text}",
            f"Alternative 3 for: {text}"
        ] 