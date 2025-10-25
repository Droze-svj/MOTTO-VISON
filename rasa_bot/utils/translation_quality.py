import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import wordnet
from nltk.metrics.distance import edit_distance
import re
from typing import Dict, List, Tuple, Any
import logging
from collections import Counter
import json
import os

logger = logging.getLogger(__name__)

class TranslationQualityAssessor:
    def __init__(self):
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')
        
        # Load language-specific rules
        self.language_rules = self._load_language_rules()
        
        # Initialize quality thresholds
        self.quality_thresholds = {
            'length_ratio': (0.7, 1.3),  # Acceptable ratio of translated length to original
            'min_confidence': 0.8,       # Minimum confidence score
            'max_edit_distance': 0.3     # Maximum normalized edit distance
        }

    def _load_language_rules(self) -> Dict[str, Dict[str, Any]]:
        """Load language-specific rules for quality assessment."""
        rules_file = os.path.join(os.path.dirname(__file__), 'language_rules.json')
        try:
            if os.path.exists(rules_file):
                with open(rules_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load language rules: {str(e)}")
        
        # Default rules if file not found
        return {
            'en': {
                'sentence_endings': ['.', '!', '?'],
                'capitalization': True,
                'common_words': ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'have', 'I']
            },
            'es': {
                'sentence_endings': ['.', '!', '?', '¿', '¡'],
                'capitalization': True,
                'common_words': ['el', 'la', 'los', 'las', 'y', 'en', 'de', 'que', 'es', 'son']
            },
            'fr': {
                'sentence_endings': ['.', '!', '?'],
                'capitalization': True,
                'common_words': ['le', 'la', 'les', 'et', 'en', 'de', 'que', 'est', 'sont', 'dans']
            }
        }

    def assess_quality(self, original: str, translated: str, 
                      source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Comprehensive quality assessment of translation."""
        try:
            # Basic validation
            if not original or not translated:
                return {
                    'score': 0.0,
                    'issues': ['Empty input or translation'],
                    'confidence': 0.0
                }
            
            # Calculate various metrics
            length_ratio = len(translated) / len(original)
            edit_dist = self._calculate_edit_distance(original, translated)
            sentence_structure = self._check_sentence_structure(translated, target_lang)
            word_preservation = self._check_word_preservation(original, translated)
            grammar_issues = self._check_grammar(translated, target_lang)
            
            # Calculate overall score
            score = self._calculate_score(
                length_ratio=length_ratio,
                edit_distance=edit_dist,
                sentence_structure=sentence_structure,
                word_preservation=word_preservation,
                grammar_issues=grammar_issues
            )
            
            # Collect all issues
            issues = []
            if length_ratio < self.quality_thresholds['length_ratio'][0]:
                issues.append(f"Translation too short (ratio: {length_ratio:.2f})")
            elif length_ratio > self.quality_thresholds['length_ratio'][1]:
                issues.append(f"Translation too long (ratio: {length_ratio:.2f})")
            
            issues.extend(grammar_issues)
            
            # Calculate confidence
            confidence = self._calculate_confidence(
                score=score,
                length_ratio=length_ratio,
                edit_distance=edit_dist,
                issues=issues
            )
            
            return {
                'score': score,
                'issues': issues,
                'confidence': confidence,
                'metrics': {
                    'length_ratio': length_ratio,
                    'edit_distance': edit_dist,
                    'sentence_structure': sentence_structure,
                    'word_preservation': word_preservation
                }
            }
        except Exception as e:
            logger.error(f"Error in quality assessment: {str(e)}")
            return {
                'score': 0.0,
                'issues': [f'Assessment error: {str(e)}'],
                'confidence': 0.0
            }

    def _calculate_edit_distance(self, original: str, translated: str) -> float:
        """Calculate normalized edit distance between original and translation."""
        original_tokens = word_tokenize(original.lower())
        translated_tokens = word_tokenize(translated.lower())
        
        if not original_tokens or not translated_tokens:
            return 1.0
        
        distance = edit_distance(original_tokens, translated_tokens)
        max_length = max(len(original_tokens), len(translated_tokens))
        return distance / max_length

    def _check_sentence_structure(self, text: str, lang: str) -> float:
        """Check sentence structure and punctuation."""
        rules = self.language_rules.get(lang, self.language_rules['en'])
        sentences = sent_tokenize(text)
        
        if not sentences:
            return 0.0
        
        score = 1.0
        for sentence in sentences:
            # Check capitalization
            if rules['capitalization'] and sentence and not sentence[0].isupper():
                score *= 0.9
            
            # Check sentence ending
            if not any(sentence.rstrip().endswith(end) for end in rules['sentence_endings']):
                score *= 0.9
        
        return score

    def _check_word_preservation(self, original: str, translated: str) -> float:
        """Check preservation of important words."""
        original_words = set(word.lower() for word in word_tokenize(original))
        translated_words = set(word.lower() for word in word_tokenize(translated))
        
        if not original_words:
            return 0.0
        
        # Count preserved words
        preserved = len(original_words.intersection(translated_words))
        return preserved / len(original_words)

    def _check_grammar(self, text: str, lang: str) -> List[str]:
        """Check for grammar issues."""
        issues = []
        rules = self.language_rules.get(lang, self.language_rules['en'])
        
        # Check for common grammar patterns
        sentences = sent_tokenize(text)
        for i, sentence in enumerate(sentences):
            # Check capitalization
            if rules['capitalization'] and sentence and not sentence[0].isupper():
                issues.append(f"Sentence {i+1} should start with a capital letter")
            
            # Check for repeated words
            words = word_tokenize(sentence)
            for j in range(len(words)-1):
                if words[j].lower() == words[j+1].lower():
                    issues.append(f"Repeated word in sentence {i+1}: '{words[j]}'")
        
        return issues

    def _calculate_score(self, length_ratio: float, edit_distance: float,
                        sentence_structure: float, word_preservation: float,
                        grammar_issues: List[str]) -> float:
        """Calculate overall quality score."""
        # Base score components
        length_score = 1.0 if self.quality_thresholds['length_ratio'][0] <= length_ratio <= self.quality_thresholds['length_ratio'][1] else 0.5
        distance_score = 1.0 - edit_distance
        structure_score = sentence_structure
        preservation_score = word_preservation
        
        # Calculate weighted average
        weights = {
            'length': 0.2,
            'distance': 0.3,
            'structure': 0.3,
            'preservation': 0.2
        }
        
        score = (
            length_score * weights['length'] +
            distance_score * weights['distance'] +
            structure_score * weights['structure'] +
            preservation_score * weights['preservation']
        )
        
        # Penalize for grammar issues
        if grammar_issues:
            score *= (1.0 - min(len(grammar_issues) * 0.1, 0.5))
        
        return max(0.0, min(1.0, score))

    def _calculate_confidence(self, score: float, length_ratio: float,
                            edit_distance: float, issues: List[str]) -> float:
        """Calculate confidence in the quality assessment."""
        # Base confidence on score
        confidence = score
        
        # Adjust based on length ratio
        if not (self.quality_thresholds['length_ratio'][0] <= length_ratio <= self.quality_thresholds['length_ratio'][1]):
            confidence *= 0.8
        
        # Adjust based on edit distance
        if edit_distance > self.quality_thresholds['max_edit_distance']:
            confidence *= 0.8
        
        # Adjust based on number of issues
        if issues:
            confidence *= (1.0 - min(len(issues) * 0.1, 0.5))
        
        return max(0.0, min(1.0, confidence)) 