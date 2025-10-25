import os
import yaml
from typing import Dict, List, Optional, Tuple, Union, Any
from langdetect import detect, DetectorFactory, LangDetectException
import logging
import json
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import re
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor, as_completed
from .translation_optimizer import TranslationOptimizer
from .translation_monitor import TranslationMonitor, TranslationMetrics
import time
from deep_translator import GoogleTranslator as DeepGoogleTranslator
from nltk.translate.bleu_score import sentence_bleu
from nltk.tokenize import word_tokenize
import nltk
from nltk.corpus import wordnet
import threading
import sqlite3
from pathlib import Path
import string
from nltk.translate.bleu_score import SmoothingFunction

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)

logger = logging.getLogger(__name__)

class TranslationError(Exception):
    """Custom exception for translation errors"""
    pass

class RateLimiter:
    """Rate limiter for translation requests."""
    def __init__(self, max_requests: int = 10, time_window: int = 60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
        
    def can_make_request(self) -> bool:
        """Check if a new request can be made."""
        now = time.time()
        # Remove old requests
        self.requests = [req_time for req_time in self.requests if now - req_time < self.time_window]
        return len(self.requests) < self.max_requests
        
    def add_request(self):
        """Add a new request timestamp."""
        self.requests.append(time.time())

class TranslationMemory:
    """Manages translation memory using SQLite database."""
    
    def __init__(self, db_path: str = 'translation_memory.db'):
        """Initialize translation memory."""
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize database and tables."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS translations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        source_text TEXT NOT NULL,
                        target_text TEXT NOT NULL,
                        source_language TEXT NOT NULL,
                        target_language TEXT NOT NULL,
                        quality_score REAL NOT NULL,
                        usage_count INTEGER DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        UNIQUE(source_text, target_language)
                    )
                ''')
                conn.commit()
        except Exception as e:
            logger.error(f"Error initializing translation memory database: {str(e)}")
    
    def add_translation(self, source_text: str, target_text: str, source_language: str, target_language: str, quality_score: float) -> None:
        """Add a translation to memory."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO translations (source_text, target_text, source_language, target_language, quality_score, usage_count)
                    VALUES (?, ?, ?, ?, ?, COALESCE((SELECT usage_count + 1 FROM translations WHERE source_text = ? AND target_language = ?), 1))
                """, (source_text, target_text, source_language, target_language, quality_score, source_text, target_language))
                conn.commit()
        except Exception as e:
            logger.error(f"Error adding translation to memory: {str(e)}")
    
    def get_translation(self, source_text: str, target_language: str) -> Optional[Dict[str, Any]]:
        """Get a translation from memory."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT target_text, source_language, quality_score
                    FROM translations
                    WHERE source_text = ? AND target_language = ?
                """, (source_text, target_language))
                result = cursor.fetchone()
                if result:
                    return {
                        'target_text': result[0],
                        'source_language': result[1],
                        'quality_score': result[2]
                    }
        except Exception as e:
            logger.error(f"Error retrieving translation from memory: {str(e)}")
        return None
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about the translation memory."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("""
                    SELECT 
                        COUNT(*) as total_translations,
                        AVG(quality_score) as average_quality,
                        SUM(usage_count) as total_usage,
                        COUNT(DISTINCT source_language) as source_languages,
                        COUNT(DISTINCT target_language) as target_languages
                    FROM translations
                """)
                result = cursor.fetchone()
                
                if result:
                    return {
                        'total_translations': result[0],
                        'average_quality': result[1] or 0.0,
                        'total_usage': result[2] or 0,
                        'source_languages': result[3],
                        'target_languages': result[4]
                    }
                return {
                    'total_translations': 0,
                    'average_quality': 0.0,
                    'total_usage': 0,
                    'source_languages': 0,
                    'target_languages': 0
                }
        except Exception as e:
            logger.error(f"Error getting translation memory statistics: {str(e)}")
            return {
                'total_translations': 0,
                'average_quality': 0.0,
                'total_usage': 0,
                'source_languages': 0,
                'target_languages': 0
            }

class TranslationAnalytics:
    """System for collecting and analyzing translation statistics."""
    
    def __init__(self, db_path: str = "translation_analytics.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize the analytics database."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS translation_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source_lang TEXT,
                    target_lang TEXT,
                    text_length INTEGER,
                    translation_time REAL,
                    quality_score REAL,
                    error_type TEXT,
                    created_at TIMESTAMP
                )
            """)
    
    def log_translation(self, source_lang: str, target_lang: str, 
                       text_length: int, translation_time: float,
                       quality_score: float, error_type: Optional[str] = None):
        """Log translation statistics."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO translation_stats 
                (source_lang, target_lang, text_length, translation_time, 
                 quality_score, error_type, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (source_lang, target_lang, text_length, translation_time,
                 quality_score, error_type, datetime.now()))
    
    def get_statistics(self) -> Dict:
        """Get translation statistics."""
        with sqlite3.connect(self.db_path) as conn:
            stats = {
                'total_translations': 0,
                'average_quality': 0.0,
                'average_time': 0.0,
                'error_rate': 0.0,
                'language_pairs': defaultdict(int)
            }
            
            # Get total translations and averages
            cursor = conn.execute("""
                SELECT COUNT(*), AVG(quality_score), AVG(translation_time)
                FROM translation_stats
            """)
            total, avg_quality, avg_time = cursor.fetchone()
            stats['total_translations'] = total
            stats['average_quality'] = avg_quality or 0.0
            stats['average_time'] = avg_time or 0.0
            
            # Get error rate
            cursor = conn.execute("""
                SELECT COUNT(*) FROM translation_stats WHERE error_type IS NOT NULL
            """)
            error_count = cursor.fetchone()[0]
            stats['error_rate'] = (error_count / total * 100) if total > 0 else 0.0
            
            # Get language pair statistics
            cursor = conn.execute("""
                SELECT source_lang, target_lang, COUNT(*)
                FROM translation_stats
                GROUP BY source_lang, target_lang
            """)
            for source, target, count in cursor:
                stats['language_pairs'][f"{source}->{target}"] = count
            
            return stats

class GoogleTranslator:
    """Enhanced Google Translator with fallback services and quality metrics."""
    
    def __init__(self, cache_ttl: int = 3600):
        self.translator = DeepGoogleTranslator()
        self.supported_languages = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
            'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi'
        }
        self.rate_limiter = RateLimiter()
        self.max_retries = 3
        self.retry_delay = 1  # seconds
        self.cache = {}
        self.cache_ttl = cache_ttl
        self.last_request_time = 0
        self.min_request_interval = 0.5  # seconds
        self.batch_size = 10
        self.quality_metrics = defaultdict(list)
        self.translation_memory = TranslationMemory()
        self.analytics = TranslationAnalytics()
        self._lock = threading.Lock()
        
    def _wait_for_rate_limit(self):
        """Wait if rate limit is reached."""
        while not self.rate_limiter.can_make_request():
            time.sleep(0.1)
        self.rate_limiter.add_request()
        
    def _retry_with_backoff(self, func, *args, **kwargs):
        """Retry a function with exponential backoff."""
        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if attempt == self.max_retries - 1:
                    raise TranslationError(f"Max retries exceeded: {str(e)}")
                time.sleep(self.retry_delay * (2 ** attempt))
                
    def _get_cache_key(self, text: str, src: str, dest: str) -> str:
        """Generate a cache key for the translation."""
        return f"{src}:{dest}:{text}"
        
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached translation is still valid."""
        if cache_key not in self.cache:
            return False
        cache_time, _ = self.cache[cache_key]
        return (datetime.now() - cache_time).total_seconds() < self.cache_ttl
        
    def _update_quality_metrics(self, original: str, translated: str, source_lang: str, target_lang: str):
        """Update translation quality metrics."""
        metrics = {
            'length_ratio': len(translated) / len(original) if original else 0,
            'word_count_ratio': len(translated.split()) / len(original.split()) if original else 0,
            'timestamp': datetime.now()
        }
        self.quality_metrics[f"{source_lang}-{target_lang}"].append(metrics)
        
    def _rate_limit(self):
        """Implement rate limiting."""
        with self._lock:
            current_time = time.time()
            time_since_last_request = current_time - self.last_request_time
            if time_since_last_request < self.min_request_interval:
                time.sleep(self.min_request_interval - time_since_last_request)
            self.last_request_time = time.time()
    
    def _get_cached_translation(self, text: str, target_lang: str) -> Optional[Dict]:
        """Get cached translation if available and not expired."""
        cache_key = f"{text}:{target_lang}"
        if cache_key in self.cache:
            cached_result, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                return cached_result
            del self.cache[cache_key]
        return None
    
    def _cache_translation(self, text: str, target_lang: str, result: Dict):
        """Cache translation result."""
        cache_key = f"{text}:{target_lang}"
        self.cache[cache_key] = (result, time.time())
    
    def _calculate_quality_metrics(self, source_text: str, translated_text: str, source_language: str, target_language: str) -> Dict[str, Any]:
        """Calculate quality metrics for translation."""
        metrics = {
            'bleu_score': 0.0,
            'length_ratio': 0.0,
            'confidence': 0.0,
            'case_pattern_score': 0.0,
            'email_preservation_score': 0.0,
            'tag_preservation_score': 0.0,
            'format_preservation': 0.0,
            'number_preservation_score': 0.0,
            'punctuation_pattern_score': 0.0,
            'special_char_preservation': 0.0,
            'url_preservation_score': 0.0,
            'hashtag_preservation_score': 0.0,
            'mention_preservation_score': 0.0,
            'currency_preservation_score': 0.0
        }
        try:
            # Calculate BLEU score
            metrics['bleu_score'] = self._calculate_bleu_score(source_text, translated_text)

            # Calculate length ratio
            metrics['length_ratio'] = len(translated_text) / len(source_text)

            # Calculate confidence
            metrics['confidence'] = self._calculate_confidence(source_text, translated_text)

            # Calculate case pattern preservation
            metrics['case_pattern_score'] = self._calculate_case_pattern_preservation(source_text, translated_text)

            # Calculate email preservation
            metrics['email_preservation_score'] = self._calculate_email_preservation(source_text, translated_text)

            # Calculate tag preservation
            metrics['tag_preservation_score'] = self._calculate_tag_preservation(source_text, translated_text)

            # Calculate format preservation
            metrics['format_preservation'] = self._calculate_format_preservation(source_text, translated_text)

            # Calculate number preservation
            metrics['number_preservation_score'] = self._calculate_number_preservation(source_text, translated_text)

            # Calculate punctuation pattern preservation
            metrics['punctuation_pattern_score'] = self._calculate_punctuation_pattern_preservation(source_text, translated_text)

            # Calculate special character preservation
            metrics['special_char_preservation'] = self._calculate_special_char_preservation(source_text, translated_text)

            # Calculate URL preservation
            metrics['url_preservation_score'] = self._calculate_url_preservation(source_text, translated_text)

            # Calculate hashtag preservation
            metrics['hashtag_preservation_score'] = self._calculate_hashtag_preservation(source_text, translated_text)

            # Calculate mention preservation
            metrics['mention_preservation_score'] = self._calculate_mention_preservation(source_text, translated_text)

            # Calculate currency preservation
            metrics['currency_preservation_score'] = self._calculate_currency_preservation(source_text, translated_text)

        except Exception as e:
            logger.error(f"Error calculating quality metrics: {str(e)}")

        return metrics

    def _calculate_case_pattern_score(self, source: str, target: str) -> float:
        """Calculate case pattern preservation score."""
        source_words = source.split()
        target_words = target.split()
        if len(source_words) != len(target_words):
            return 0.0
        matches = sum(1 for s, t in zip(source_words, target_words) 
                     if s.isupper() == t.isupper() and s.islower() == t.islower())
        return matches / len(source_words) if source_words else 0.0

    def _calculate_email_preservation_score(self, source: str, target: str) -> float:
        """Calculate email address preservation score."""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        source_emails = set(re.findall(email_pattern, source))
        target_emails = set(re.findall(email_pattern, target))
        return len(source_emails.intersection(target_emails)) / len(source_emails) if source_emails else 1.0

    def _calculate_tag_preservation_score(self, source: str, target: str) -> float:
        """Calculate HTML tag preservation score."""
        tag_pattern = r'<[^>]+>'
        source_tags = set(re.findall(tag_pattern, source))
        target_tags = set(re.findall(tag_pattern, target))
        return len(source_tags.intersection(target_tags)) / len(source_tags) if source_tags else 1.0

    def _calculate_url_preservation_score(self, source: str, target: str) -> float:
        """Calculate URL preservation score."""
        url_pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+'
        source_urls = set(re.findall(url_pattern, source))
        target_urls = set(re.findall(url_pattern, target))
        return len(source_urls.intersection(target_urls)) / len(source_urls) if source_urls else 1.0

    def _calculate_punctuation_pattern_score(self, source: str, target: str) -> float:
        """Calculate punctuation pattern preservation score."""
        source_punct = ''.join(c for c in source if c in string.punctuation)
        target_punct = ''.join(c for c in target if c in string.punctuation)
        if not source_punct:
            return 1.0
        return 1.0 - (self._levenshtein_distance(source_punct, target_punct) / len(source_punct))

    def _calculate_format_preservation(self, source: str, target: str) -> float:
        """Calculate format preservation score."""
        # Check for preserved whitespace patterns
        source_lines = source.splitlines()
        target_lines = target.splitlines()
        if len(source_lines) != len(target_lines):
            return 0.0
        
        # Check indentation and line breaks
        source_indent = [len(line) - len(line.lstrip()) for line in source_lines]
        target_indent = [len(line) - len(line.lstrip()) for line in target_lines]
        indent_score = sum(1 for s, t in zip(source_indent, target_indent) if s == t) / len(source_lines)
        
        # Check paragraph breaks
        source_paras = source.split('\n\n')
        target_paras = target.split('\n\n')
        para_score = len(source_paras) == len(target_paras)
        
        return (indent_score + float(para_score)) / 2
    
    def translate(self, text: str, src: str = 'auto', dest: str = 'en') -> str:
        """Translate text with retry mechanism and caching."""
        try:
            # Validate language codes
            if dest not in self.supported_languages and dest != 'auto':
                raise TranslationError(f"Unsupported target language: {dest}")
            if src not in self.supported_languages and src != 'auto':
                raise TranslationError(f"Unsupported source language: {src}")
                
            # Validate text length
            if len(text) > 5000:
                raise TranslationError("Text too long (max 5000 characters)")
            if not text.strip():
                raise TranslationError("Empty text provided")
                
            # Check cache
            cache_key = self._get_cache_key(text, src, dest)
            if self._is_cache_valid(cache_key):
                return self.cache[cache_key][1]
                
            # Wait for rate limit
            self._wait_for_rate_limit()
            
            # Translate with retry
            def translate_func():
                source = 'auto' if src == 'auto' else src
                return self.translator.translate(text, source=source, target=dest)
                
            translated = self._retry_with_backoff(translate_func)
            
            # Update cache
            self.cache[cache_key] = (datetime.now(), translated)
            
            # Update quality metrics
            self._update_quality_metrics(text, translated, src, dest)
            
            return translated
            
        except Exception as e:
            raise TranslationError(f"Translation failed: {str(e)}")
            
    def detect(self, text: str) -> str:
        """Detect language with retry mechanism."""
        try:
            if not text.strip():
                raise TranslationError("Empty text provided")
                
            def detect_func():
                return detect(text)
                
            return self._retry_with_backoff(detect_func)
            
        except Exception as e:
            raise TranslationError(f"Language detection failed: {str(e)}")
            
    def batch_translate(self, texts: List[str], target_language: str = 'es', source_language: str = 'auto') -> List[Dict[str, Any]]:
        """Translate multiple texts in parallel."""
        results = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            for text in texts:
                future = executor.submit(
                    self.translate_text,
                    text=text,
                    target_lang=target_language,
                    source_lang=source_language
                )
                futures.append(future)
            
            for future in as_completed(futures):
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    logger.error(f"Error in batch translation: {str(e)}")
                    results.append({
                        'success': False,
                        'error': str(e),
                        'quality': {
                            'confidence': 0.0,
                            'bleu_score': 0.0,
                            'length_ratio': 0.0,
                            'case_pattern_score': 0.0,
                            'email_preservation_score': 0.0,
                            'tag_preservation_score': 0.0,
                            'format_preservation': 0.0,
                            'number_preservation': 0.0,
                            'punctuation_preservation': 0.0,
                            'special_char_preservation': 0.0,
                            'url_preservation_score': 0.0,
                            'punctuation_pattern_score': 0.0
                        }
                    })
        
        return results
        
    def get_quality_metrics(self) -> Dict[str, Any]:
        """Get translation quality metrics."""
        metrics = {}
        for lang_pair, measurements in self.quality_metrics.items():
            if measurements:
                metrics[lang_pair] = {
                    'avg_length_ratio': sum(m['length_ratio'] for m in measurements) / len(measurements),
                    'avg_word_count_ratio': sum(m['word_count_ratio'] for m in measurements) / len(measurements),
                    'total_translations': len(measurements),
                    'last_translation': measurements[-1]['timestamp'].isoformat()
                }
        return metrics
        
    def clear_cache(self):
        """Clear the translation cache."""
        self.cache.clear()
        
    def set_cache_ttl(self, ttl: int):
        """Set cache TTL in seconds."""
        self.cache_ttl = ttl

    def translate_text(self, text: str, target_language: str, source_language: Optional[str] = None) -> Dict[str, Any]:
        """Translate text to target language."""
        start_time = time.time()
        retries = 0
        max_retries = self.max_retries
        while retries < max_retries:
            try:
                # Check translation memory first
                if source_language:
                    memory_result = self.translation_memory.get_translation(text, target_language)
                    if memory_result:
                        return {
                            'translated_text': memory_result['target_text'],
                            'source_language': memory_result['source_language'],
                            'target_language': target_language,
                            'quality': {
                                'score': memory_result['quality_score'],
                                'confidence': 0.9  # Assuming high confidence for memory hits
                            },
                            'success': True,
                            'detected_language': memory_result['source_language']
                        }

                # Check cache
                cache_key = f"{text}:{target_language}"
                if cache_key in self.cache:
                    return self.cache[cache_key]

                # Validate languages
                if not self._validate_language(target_language):
                    raise ValueError(f"Invalid target language: {target_language}")
                if source_language and not self._validate_language(source_language):
                    raise ValueError(f"Invalid source language: {source_language}")

                # Detect language if not provided
                if not source_language:
                    source_language = self.detect(text)
                    if not source_language:
                        raise ValueError("Could not detect source language")

                # Apply rate limiting
                current_time = time.time()
                if hasattr(self, '_last_request_time'):
                    time_since_last_request = current_time - self._last_request_time
                    if time_since_last_request < 0.5:  # Minimum 0.5 seconds between requests
                        time.sleep(0.5 - time_since_last_request)
                self._last_request_time = time.time()

                # Translate text
                translated_text = self.translator.translate(text, target_language, source_language)
                if not translated_text:
                    raise ValueError("Translation failed")

                # Calculate quality metrics
                quality_metrics = self._calculate_quality_metrics(text, translated_text, source_language, target_language)

                # Store in memory and cache
                self.translation_memory.add_translation(text, translated_text, source_language, target_language, quality_metrics['score'])
                result = {
                    'translated_text': translated_text,
                    'source_language': source_language,
                    'target_language': target_language,
                    'quality': quality_metrics,
                    'success': True,
                    'detected_language': source_language
                }
                self.cache[cache_key] = result

                # Log analytics
                self.analytics.log_translation(source_language, target_language, len(text), time.time() - start_time, quality_metrics['score'])

                return result

            except Exception as e:
                retries += 1
                if retries >= max_retries:
                    return {
                        'success': False,
                        'translated_text': text,
                        'error': str(e),
                        'quality': {
                            'score': 0.0,
                            'confidence': 0.0
                        },
                        'retries': retries,
                        'detected_language': source_language
                    }
                time.sleep(0.5)  # Wait before retrying

class TranslationManager:
    """Manager for translation operations, memory, and analytics."""
    def __init__(self, config: Dict[str, Any]):
        """Initialize translation manager."""
        self.config = config
        # Directly initialize the translator here
        self.translator = GoogleTranslator(cache_ttl=config.get('cache_ttl', 3600))
        self.metrics = TranslationMetrics()
        self.translation_memory = TranslationMemory()
        self.analytics = TranslationAnalytics()
        self.optimizer = TranslationOptimizer()
        self.rate_limit = config.get('rate_limit', True)
        self.quality_thresholds = {
            'min_score': 0.18,
            'min_confidence': 0.8,
            'min_success_rate': 0.8,
            'max_retries': 3,
            'max_translation_time': 10.0
        }

    def translate_text(self, text: str, target_language: str = 'es', source_language: str = 'auto') -> Dict[str, Any]:
        """Translate text to target language."""
        start_time = time.time()
        retries = 0
        max_retries = self.quality_thresholds['max_retries']
        while retries < max_retries:
            try:
                # Check translation memory first
                if self.translation_memory:
                    memory_result = self.translation_memory.get_translation(text, target_language)
                    if memory_result:
                        return {
                            'translated_text': memory_result['target_text'],
                            'source_language': memory_result['source_language'],
                            'target_language': target_language,
                            'quality': {
                                'score': memory_result['quality_score'],
                                'confidence': 0.9  # Assuming high confidence for memory hits
                            },
                            'success': True,
                            'detected_language': memory_result['source_language']
                        }
            
                # Translate the text
                translated = self.translator.translate(text, source_language, target_language)
                
                # Calculate quality metrics
                quality_metrics = self._calculate_quality_metrics(text, translated, source_language, target_language)
                
                # Store in translation memory
                if self.translation_memory:
                    self.translation_memory.add_translation(
                        text,
                        translated,
                        source_language,
                        target_language,
                        quality_metrics['score']
                    )
                
                # Log analytics
                self.analytics.log_translation(
                    source_language,
                    target_language,
                    len(text),
                    time.time() - start_time,
                    quality_metrics['score']
                )
                
                return {
                    'translated_text': translated,
                    'source_language': source_language,
                    'target_language': target_language,
                    'quality': quality_metrics,
                    'success': True,
                    'detected_language': source_language
                }
            except Exception as e:
                retries += 1
                if retries >= max_retries:
                    return {
                        'success': False,
                        'translated_text': text,
                        'error': str(e),
                        'quality': {
                            'score': 0.0,
                            'confidence': 0.0
                        },
                        'retries': retries,
                        'detected_language': source_language
                    }
                time.sleep(0.5)  # Wait before retrying

    def batch_translate(self, texts: list, target_language: str = 'es', source_language: str = 'auto') -> list:
        """Translate multiple texts in parallel."""
        results = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            for text in texts:
                future = executor.submit(
                    self.translate_text,
                    text=text,
                    target_language=target_language,
                    source_language=source_language
                )
                futures.append(future)
            for future in as_completed(futures):
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    logger.error(f"Error in batch translation: {str(e)}")
                    results.append({
                        'success': False,
                        'translated_text': '',
                        'error': str(e),
                        'quality': self._calculate_quality_metrics('', '', source_language, target_language)
                    })
        return results

    def detect(self, text: str) -> str:
        """Detect language with retry mechanism."""
        try:
            if not text.strip():
                raise TranslationError("Empty text provided")
                
            def detect_func():
                return detect(text)
                
            return self.translator.detect(text)
            
        except Exception as e:
            raise TranslationError(f"Language detection failed: {str(e)}")

    def _calculate_quality_metrics(self, source_text: str, translated_text: str, source_language: str, target_language: str) -> Dict[str, Any]:
        """Calculate translation quality metrics."""
        try:
            # Initialize metrics with default values
            metrics = {
                'bleu_score': 0.0,
                'length_ratio': 0.0,
                'confidence': 0.0,
                'case_pattern_score': 0.0,
                'email_preservation_score': 0.0,
                'tag_preservation_score': 0.0,
                'format_preservation': 0.0,
                'number_preservation': 0.0,
                'punctuation_preservation': 0.0,
                'special_char_preservation': 0.0
            }
            
            # Calculate length ratio
            metrics['length_ratio'] = len(translated_text) / len(source_text)
            
            # Calculate BLEU score
            try:
                source_tokens = word_tokenize(source_text.lower())
                translated_tokens = word_tokenize(translated_text.lower())
                metrics['bleu_score'] = sentence_bleu([source_tokens], translated_tokens)
            except Exception as e:
                logger.warning(f"Error calculating BLEU score: {str(e)}")
                metrics['bleu_score'] = 0.0
            
            # Calculate case pattern preservation
            try:
                source_case = ''.join('U' if c.isupper() else 'L' for c in source_text)
                translated_case = ''.join('U' if c.isupper() else 'L' for c in translated_text)
                metrics['case_pattern_score'] = sum(1 for a, b in zip(source_case, translated_case) if a == b) / len(source_case) if source_case else 0.0
            except Exception as e:
                logger.warning(f"Error calculating case pattern score: {str(e)}")
            
            # Calculate email preservation
            try:
                email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
                source_emails = set(re.findall(email_pattern, source_text))
                translated_emails = set(re.findall(email_pattern, translated_text))
                metrics['email_preservation_score'] = len(source_emails.intersection(translated_emails)) / len(source_emails) if source_emails else 1.0
            except Exception as e:
                logger.warning(f"Error calculating email preservation score: {str(e)}")
            
            # Calculate tag preservation
            try:
                tag_pattern = r'<[^>]+>'
                source_tags = set(re.findall(tag_pattern, source_text))
                translated_tags = set(re.findall(tag_pattern, translated_text))
                metrics['tag_preservation_score'] = len(source_tags.intersection(translated_tags)) / len(source_tags) if source_tags else 1.0
            except Exception as e:
                logger.warning(f"Error calculating tag preservation score: {str(e)}")
            
            # Calculate format preservation
            try:
                source_format = re.sub(r'[a-zA-Z0-9]', 'X', source_text)
                translated_format = re.sub(r'[a-zA-Z0-9]', 'X', translated_text)
                metrics['format_preservation'] = sum(1 for a, b in zip(source_format, translated_format) if a == b) / len(source_format) if source_format else 0.0
            except Exception as e:
                logger.warning(f"Error calculating format preservation: {str(e)}")
            
            # Calculate number preservation
            try:
                source_numbers = set(re.findall(r'\d+', source_text))
                translated_numbers = set(re.findall(r'\d+', translated_text))
                metrics['number_preservation'] = len(source_numbers.intersection(translated_numbers)) / len(source_numbers) if source_numbers else 1.0
            except Exception as e:
                logger.warning(f"Error calculating number preservation: {str(e)}")
            
            # Calculate punctuation preservation
            try:
                source_punct = set(re.findall(r'[^\w\s]', source_text))
                translated_punct = set(re.findall(r'[^\w\s]', translated_text))
                metrics['punctuation_preservation'] = len(source_punct.intersection(translated_punct)) / len(source_punct) if source_punct else 1.0
            except Exception as e:
                logger.warning(f"Error calculating punctuation preservation: {str(e)}")
            
            # Calculate special character preservation
            try:
                source_special = set(re.findall(r'[^a-zA-Z0-9\s]', source_text))
                translated_special = set(re.findall(r'[^a-zA-Z0-9\s]', translated_text))
                metrics['special_char_preservation'] = len(source_special.intersection(translated_special)) / len(source_special) if source_special else 1.0
            except Exception as e:
                logger.warning(f"Error calculating special character preservation: {str(e)}")
            
            # Calculate overall confidence
            metrics['confidence'] = (
                metrics['bleu_score'] * 0.3 +
                metrics['length_ratio'] * 0.1 +
                metrics['case_pattern_score'] * 0.1 +
                metrics['email_preservation_score'] * 0.1 +
                metrics['tag_preservation_score'] * 0.1 +
                metrics['format_preservation'] * 0.1 +
                metrics['number_preservation'] * 0.1 +
                metrics['punctuation_preservation'] * 0.05 +
                metrics['special_char_preservation'] * 0.05
            )
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating quality metrics: {str(e)}")
            # Return default metrics with all keys set to 0.0
            return {
                'bleu_score': 0.0,
                'length_ratio': 0.0,
                'confidence': 0.0,
                'case_pattern_score': 0.0,
                'email_preservation_score': 0.0,
                'tag_preservation_score': 0.0,
                'format_preservation': 0.0,
                'number_preservation': 0.0,
                'punctuation_preservation': 0.0,
                'special_char_preservation': 0.0
            }

    def _is_valid_language_code(self, language: str) -> bool:
        """Check if a language code is valid."""
        return language in self.translator.supported_languages or language == 'auto'

    def get_quality_metrics(self) -> Dict:
        """Get translation quality metrics."""
        return self.analytics.get_statistics()

    def get_translation_report(self) -> Dict:
        """Get comprehensive translation report."""
        return self.analytics.get_statistics()

    def get_translation_suggestions(self, text: str, target_language: str) -> List[str]:
        """Get alternative translation suggestions."""
        return self.optimizer.get_translation_suggestions(text, target_language)

    def check_spelling(self, text: str) -> Dict:
        """Check spelling in text."""
        return self.optimizer.check_spelling(text)

    def validate_grammar(self, text: str) -> Dict[str, Any]:
        """Validate grammar in text."""
        try:
            # Basic grammar rules
            issues = []
            
            # Check for capitalization at the start of sentences
            sentences = text.split('. ')
            for i, sentence in enumerate(sentences):
                if sentence and not sentence[0].isupper():
                    issues.append(f"Sentence {i+1} should start with a capital letter")
            
            # Check for subject-verb agreement
            common_errors = [
                ('I is', 'I am'),
                ('they is', 'they are'),
                ('he are', 'he is'),
                ('she are', 'she is'),
                ('it are', 'it is'),
                ('we is', 'we are'),
                ('you is', 'you are')
            ]
            
            for error, correction in common_errors:
                if error.lower() in text.lower():
                    issues.append(f"Subject-verb agreement error: '{error}' should be '{correction}'")
            
            # Check for common punctuation errors
            if text.count('!') > 1 and '!!' in text:
                issues.append("Multiple exclamation marks should be avoided")
            if text.count('?') > 1 and '??' in text:
                issues.append("Multiple question marks should be avoided")
            
            # Check for missing spaces after punctuation
            for punct in ['.', ',', '!', '?']:
                if f"{punct}[a-zA-Z]" in text:
                    issues.append(f"Missing space after {punct}")
            
            # Check for repeated words
            words = text.split()
            for i in range(len(words)-1):
                if words[i].lower() == words[i+1].lower():
                    issues.append(f"Repeated word: '{words[i]}'")
            
            return {
                'has_issues': len(issues) > 0,
                'issues': issues
            }
            
        except Exception as e:
            logger.error(f"Grammar validation error: {str(e)}")
            return {
                'has_issues': False,
                'issues': [f"Error in grammar validation: {str(e)}"]
            }

    def get_synonyms(self, word: str) -> List[str]:
        """Get synonyms for a word."""
        try:
            # Common synonyms for frequently used words
            common_synonyms = {
                'happy': ['joyful', 'cheerful', 'delighted', 'pleased', 'glad', 'content', 'merry'],
                'big': ['large', 'huge', 'enormous', 'massive', 'gigantic', 'tremendous', 'colossal'],
                'fast': ['quick', 'rapid', 'swift', 'speedy', 'brisk', 'hasty', 'fleet'],
                'beautiful': ['attractive', 'lovely', 'gorgeous', 'stunning', 'pretty', 'handsome', 'elegant'],
                'good': ['excellent', 'great', 'fine', 'wonderful', 'superb', 'outstanding', 'fantastic'],
                'bad': ['poor', 'terrible', 'awful', 'horrible', 'dreadful', 'atrocious', 'abysmal'],
                'important': ['significant', 'crucial', 'essential', 'vital', 'critical', 'key', 'major'],
                'difficult': ['hard', 'challenging', 'tough', 'arduous', 'demanding', 'complex', 'complicated'],
                'small': ['tiny', 'little', 'miniature', 'petite', 'compact', 'minuscule', 'microscopic'],
                'new': ['fresh', 'novel', 'recent', 'modern', 'contemporary', 'current', 'latest'],
                'old': ['ancient', 'aged', 'elderly', 'mature', 'vintage', 'antique', 'archaic'],
                'high': ['tall', 'elevated', 'lofty', 'towering', 'soaring', 'sky-high', 'steep'],
                'low': ['short', 'small', 'tiny', 'miniature', 'petite', 'compact', 'minuscule'],
                'strong': ['powerful', 'mighty', 'forceful', 'robust', 'sturdy', 'tough', 'muscular'],
                'weak': ['feeble', 'frail', 'fragile', 'delicate', 'flimsy', 'powerless', 'helpless'],
                'hot': ['warm', 'heated', 'scorching', 'boiling', 'burning', 'sizzling', 'blazing'],
                'cold': ['cool', 'chilly', 'freezing', 'frigid', 'icy', 'frosty', 'arctic'],
                'clean': ['spotless', 'pristine', 'immaculate', 'pure', 'hygienic', 'sanitary', 'sterile'],
                'dirty': ['filthy', 'soiled', 'grimy', 'stained', 'polluted', 'contaminated', 'unclean'],
                'rich': ['wealthy', 'affluent', 'prosperous', 'opulent', 'well-off', 'moneyed', 'loaded']
            }
            
            # Get synonyms from common list
            word = word.lower()
            if word in common_synonyms:
                return common_synonyms[word]
            
            # If word not found in common list, try to find similar words
            similar_words = []
            for common_word, synonyms in common_synonyms.items():
                if self._are_words_similar(word, common_word):
                    similar_words.extend(synonyms)
            
            return list(set(similar_words))  # Remove duplicates
            
        except Exception as e:
            logger.error(f"Error getting synonyms: {str(e)}")
            return []

    def _are_words_similar(self, word1: str, word2: str) -> bool:
        """Check if two words are similar based on edit distance."""
        try:
            # Calculate Levenshtein distance
            if len(word1) < 3 or len(word2) < 3:
                return word1 == word2
            
            # Calculate edit distance
            distance = self._levenshtein_distance(word1, word2)
            
            # Words are similar if edit distance is small relative to word length
            max_length = max(len(word1), len(word2))
            return distance / max_length < 0.3
            
        except Exception as e:
            logger.error(f"Error comparing words: {str(e)}")
            return False

    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance between two strings."""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]

    def get_usage_statistics(self) -> Dict:
        """Get detailed usage statistics."""
        return {
            'total_characters': self.usage_stats['total_characters'],
            'total_words': self.usage_stats['total_words'],
            'average_text_length': self.usage_stats['average_text_length'],
            'most_common_words': dict(self.usage_stats['most_common_words'].most_common(10)),
            'average_translation_time': sum(self.usage_stats['translation_times']) / len(self.usage_stats['translation_times']) if self.usage_stats['translation_times'] else 0
        }

    def update_usage_statistics(self, text: str, translation_time: float) -> None:
        """Update usage statistics with new translation."""
        # Update character and word counts
        self.usage_stats['total_characters'] += len(text)
        words = re.findall(r'\w+', text.lower())
        self.usage_stats['total_words'] += len(words)
        self.usage_stats['most_common_words'].update(words)
        
        # Update average text length
        total_translations = len(self.translation_history)
        self.usage_stats['average_text_length'] = self.usage_stats['total_characters'] / total_translations if total_translations > 0 else 0
        
        # Update translation times
        self.usage_stats['translation_times'].append(translation_time)
        if len(self.usage_stats['translation_times']) > 1000:  # Keep only last 1000 times
            self.usage_stats['translation_times'] = self.usage_stats['translation_times'][-1000:]

    def get_cached_translation(self, text: str, target_language: str, source_language: str) -> Optional[str]:
        """Get translation from cache if available."""
        cache_key = f"{text}:{source_language}:{target_language}"
        return self.optimizer.get_cached_translation(cache_key)

    def _update_metrics(self, source_lang: str, target_lang: str, translation_time: float, success: bool) -> None:
        """Update translation metrics."""
        try:
            # Update performance metrics
            self.metrics.total_translations += 1
            self.metrics.total_time += translation_time
            self.metrics.successful_translations += 1 if success else 0
            
            # Update language pair metrics
            lang_pair = f"{source_lang}-{target_lang}"
            if lang_pair not in self.metrics.language_pairs:
                self.metrics.language_pairs[lang_pair] = {
                    'count': 0,
                    'total_time': 0,
                    'success_count': 0
                }
            
            self.metrics.language_pairs[lang_pair]['count'] += 1
            self.metrics.language_pairs[lang_pair]['total_time'] += translation_time
            self.metrics.language_pairs[lang_pair]['success_count'] += 1 if success else 0
            
            # Update error metrics
            if not success:
                self.metrics.error_count += 1
                if lang_pair not in self.metrics.error_by_language_pair:
                    self.metrics.error_by_language_pair[lang_pair] = 0
                self.metrics.error_by_language_pair[lang_pair] += 1
            
            # Update average translation time
            if self.metrics.successful_translations > 0:
                self.metrics.avg_translation_time = self.metrics.total_time / self.metrics.successful_translations
            
            # Update success rate
            if self.metrics.total_translations > 0:
                self.metrics.success_rate = self.metrics.successful_translations / self.metrics.total_translations
            
        except Exception as e:
            logger.error(f"Error updating metrics: {str(e)}")

    def _translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text using the translation service."""
        try:
            # Validate input
            if not text or not text.strip():
                raise ValueError("Invalid input text: text cannot be empty or whitespace only")
            
            if len(text) > 5000:
                raise ValueError("Text length need to be between 0 and 5000 characters")
            
            # Use the translation service
            translator = DeepGoogleTranslator(source=source_lang, target=target_lang)
            translated_text = translator.translate(text)
            
            return translated_text
            
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            raise

    def get_performance_report(self) -> Dict[str, Any]:
        """Get performance report with metrics and statistics."""
        try:
            # Calculate performance metrics
            performance_metrics = {
                'average_translation_time': self.analytics.get_average_translation_time(),
                'success_rate': self.analytics.get_success_rate(),
                'total_translations': self.analytics.get_total_translations()
            }

            # Get language statistics
            language_statistics = self.analytics.get_language_statistics()

            # Get error statistics
            error_statistics = self.analytics.get_error_statistics()

            # Calculate quality trends
            quality_trends = {
                'average_quality': self.analytics.get_average_quality(),
                'quality_over_time': self.analytics.get_quality_over_time()
            }

            return {
                'performance_metrics': performance_metrics,
                'language_statistics': language_statistics,
                'error_statistics': error_statistics,
                'quality_trends': quality_trends
            }
        except Exception as e:
            logger.error(f"Error generating performance report: {str(e)}")
            return {
                'performance_metrics': {'average_translation_time': 0, 'success_rate': 0, 'total_translations': 0},
                'language_statistics': {},
                'error_statistics': {},
                'quality_trends': {'average_quality': 0, 'quality_over_time': []}
            }

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text from source language to target language (for test compatibility)."""
        return self.translator.translate(text, src=source_lang, dest=target_lang)

    def set_cache_ttl(self, ttl: int):
        """Set cache TTL in seconds."""
        self.cache_ttl = ttl
        self.translator.set_cache_ttl(ttl)

class TranslationMetrics:
    """Tracks translation metrics and performance."""
    
    def __init__(self):
        """Initialize metrics tracking."""
        self.translation_times = []
        self.success_count = 0
        self.total_count = 0
        self.language_pair_stats = {}
        self.error_stats = {}
        self.start_time = time.time()
        
    def update_metrics(self, source_lang: str, target_lang: str, time_taken: float, success: bool) -> None:
        """Update translation metrics."""
        # Update counts
        self.total_count += 1
        if success:
            self.success_count += 1
        
        # Update translation times
        if time_taken > 0:
            self.translation_times.append(time_taken)
        
        # Update language pair stats
        pair_key = f"{source_lang}-{target_lang}"
        if pair_key not in self.language_pair_stats:
            self.language_pair_stats[pair_key] = {
                'count': 0,
                'success_count': 0,
                'total_time': 0,
                'avg_time': 0
            }
        
        pair_stats = self.language_pair_stats[pair_key]
        pair_stats['count'] += 1
        if success:
            pair_stats['success_count'] += 1
        if time_taken > 0:
            pair_stats['total_time'] += time_taken
            pair_stats['avg_time'] = pair_stats['total_time'] / pair_stats['count']
        
        # Update error stats
        if not success:
            error_type = 'unknown'
            if time_taken == 0:
                error_type = 'timeout'
            elif source_lang == 'auto':
                error_type = 'detection_failed'
            elif target_lang not in ['en', 'es', 'fr', 'de', 'it']:
                error_type = 'unsupported_language'
            
            self.error_stats[error_type] = self.error_stats.get(error_type, 0) + 1
    
    def get_success_rate(self) -> float:
        """Get overall success rate."""
        return self.success_count / self.total_count if self.total_count > 0 else 0.0
    
    def get_average_time(self) -> float:
        """Get average translation time."""
        return sum(self.translation_times) / len(self.translation_times) if self.translation_times else 0.0
    
    def get_language_pair_stats(self, source_lang: str, target_lang: str) -> Dict[str, any]:
        """Get statistics for a specific language pair."""
        pair_key = f"{source_lang}-{target_lang}"
        return self.language_pair_stats.get(pair_key, {
            'count': 0,
            'success_count': 0,
            'total_time': 0,
            'avg_time': 0
        })
    
    def get_error_stats(self) -> Dict[str, int]:
        """Get error statistics."""
        return self.error_stats
    
    def reset(self) -> None:
        """Reset all metrics."""
        self.__init__() 