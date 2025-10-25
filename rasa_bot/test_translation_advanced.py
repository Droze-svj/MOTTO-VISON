from utils.translation import TranslationManager, TranslationError
import time
import pytest

def test_batch_translation():
    print("\n=== Testing Batch Translation ===")
    translation_manager = TranslationManager()
    
    # Test batch translation with multiple texts
    texts = [
        "Hello, how are you?",
        "Good morning",
        "Thank you very much",
        "See you later"
    ]
    
    try:
        results = translation_manager.batch_translate(texts, "es", "en")
        print("\nBatch Translation Results:")
        for i, result in enumerate(results):
            print(f"\nText {i+1}:")
            print(f"Original: {texts[i]}")
            print(f"Translated: {result['translated_text']}")
            print(f"Success: {result['success']}")
            print(f"Cached: {result.get('cached', False)}")
            print(f"Translation time: {result.get('translation_time', 0):.3f}s")
    except Exception as e:
        print(f"Error in batch translation: {str(e)}")

def test_caching():
    print("\n=== Testing Translation Caching ===")
    translation_manager = TranslationManager()
    
    # Test caching with repeated translations
    text = "Hello, this is a test for caching"
    target_lang = "fr"
    
    print("\nFirst Translation (Should not be cached):")
    result1 = translation_manager.translate_text(text, target_lang, "en")
    print(f"Translated: {result1['translated_text']}")
    print(f"Cached: {result1.get('cached', False)}")
    print(f"Translation time: {result1.get('translation_time', 0):.3f}s")
    
    print("\nSecond Translation (Should be cached):")
    result2 = translation_manager.translate_text(text, target_lang, "en")
    print(f"Translated: {result2['translated_text']}")
    print(f"Cached: {result2.get('cached', False)}")
    print(f"Translation time: {result2.get('translation_time', 0):.3f}s")
    
    # Verify that cached translation is faster
    assert result2.get('translation_time', 0) < result1.get('translation_time', 0), "Cached translation should be faster"

def test_usage_statistics():
    print("\n=== Testing Usage Statistics ===")
    translation_manager = TranslationManager()
    
    # Perform some translations to generate statistics
    test_texts = [
        "Hello world",
        "This is a test",
        "Testing usage statistics",
        "Another test case",
        "Final test case"
    ]
    
    for text in test_texts:
        translation_manager.translate_text(text, "es", "en")
    
    # Get and display usage statistics
    stats = translation_manager.get_usage_statistics()
    print("\nUsage Statistics:")
    print(f"Total characters: {stats['total_characters']}")
    print(f"Total words: {stats['total_words']}")
    print(f"Average text length: {stats['average_text_length']:.2f}")
    print("\nMost common words:")
    for word, count in stats['most_common_words'].items():
        print(f"{word}: {count}")
    print(f"\nAverage translation time: {stats['average_translation_time']:.3f}s")

def test_translation_quality_metrics():
    print("\n=== Testing Translation Quality Metrics ===")
    translation_manager = TranslationManager()
    
    # Perform translations with varying success rates
    test_cases = [
        ("Hello", "es", True),
        ("", "fr", False),  # Should fail
        ("Good morning", "de", True),
        ("   ", "it", False),  # Should fail
        ("Thank you", "pt", True)
    ]
    
    for text, target_lang, should_succeed in test_cases:
        try:
            result = translation_manager.translate_text(text, target_lang, "en")
            print(f"\nText: {text}")
            print(f"Target language: {target_lang}")
            print(f"Success: {result['success']}")
            if result['success']:
                print(f"Translated: {result['translated_text']}")
        except Exception as e:
            print(f"Error: {str(e)}")
    
    # Get and display quality metrics
    metrics = translation_manager.get_translation_quality_metrics()
    print("\nTranslation Quality Metrics:")
    print(f"Success rate: {metrics['success_rate']:.2%}")
    print(f"Average translation time: {metrics['average_translation_time']:.3f}s")
    print(f"Average text length: {metrics['average_text_length']:.2f}")
    print(f"Most common source language: {metrics['most_common_source_language']}")
    print(f"Most common target language: {metrics['most_common_target_language']}")

def test_performance():
    print("\n=== Testing Performance ===")
    translation_manager = TranslationManager()
    
    # Test performance with different text lengths
    test_cases = [
        "Short text",
        "This is a medium length text for testing performance",
        "This is a much longer text that will help us test the performance of the translation system with more complex content and longer sentences."
    ]
    
    for text in test_cases:
        start_time = time.time()
        result = translation_manager.translate_text(text, "es", "en")
        end_time = time.time()
        
        print(f"\nText length: {len(text)} characters")
        print(f"Translation time: {end_time - start_time:.3f}s")
        print(f"Success: {result['success']}")
        if result['success']:
            print(f"Translated: {result['translated_text']}")

if __name__ == "__main__":
    test_batch_translation()
    test_caching()
    test_usage_statistics()
    test_translation_quality_metrics()
    test_performance() 