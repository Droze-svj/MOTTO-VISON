from utils.translation import TranslationManager, TranslationError

def test_error_handling():
    print("\n=== Testing Error Handling ===")
    translation_manager = TranslationManager()
    
    # Test 1: Invalid input text
    print("\nTest 1: Invalid Input Text")
    test_cases = [
        ("", "Empty string"),
        ("   ", "Whitespace only"),
        (None, "None value"),
        (123, "Non-string value")
    ]
    
    for text, description in test_cases:
        print(f"\nTesting {description}:")
        try:
            result = translation_manager.translate_text(text, "es", "en")
            print(f"Result: {result}")
        except Exception as e:
            print(f"Error caught: {str(e)}")
    
    # Test 2: Invalid language codes
    print("\nTest 2: Invalid Language Codes")
    test_cases = [
        ("Hello", "xx", "en", "Invalid target language"),
        ("Hello", "es", "xx", "Invalid source language"),
        ("Hello", "invalid", "en", "Invalid target language format")
    ]
    
    for text, target, source, description in test_cases:
        print(f"\nTesting {description}:")
        try:
            result = translation_manager.translate_text(text, target, source)
            print(f"Result: {result}")
        except Exception as e:
            print(f"Error caught: {str(e)}")
    
    # Test 3: Language detection with invalid input
    print("\nTest 3: Language Detection with Invalid Input")
    test_cases = [
        ("", "Empty string"),
        ("   ", "Whitespace only"),
        ("12345", "Numbers only"),
        ("!@#$%", "Special characters only")
    ]
    
    for text, description in test_cases:
        print(f"\nTesting {description}:")
        try:
            result = translation_manager.detect_language(text)
            print(f"Result: {result}")
        except Exception as e:
            print(f"Error caught: {str(e)}")

def test_enhanced_features():
    print("\n=== Testing Enhanced Features ===")
    translation_manager = TranslationManager()
    
    # Test 1: Language distribution statistics
    print("\nTest 1: Language Distribution Statistics")
    # Perform some translations
    translations = [
        ("Hello", "es"),
        ("Good morning", "fr"),
        ("Thank you", "de"),
        ("Goodbye", "it"),
        ("Welcome", "pt")
    ]
    
    for text, target_lang in translations:
        translation_manager.translate_text(text, target_lang, "en")
    
    stats = translation_manager.get_translation_stats()
    print("\nTranslation Statistics:")
    print(f"Total translations: {stats['total_translations']}")
    print(f"Successful translations: {stats['successful_translations']}")
    print(f"Failed translations: {stats['failed_translations']}")
    print("\nLanguage Distribution:")
    print("Source languages:", stats['language_distribution']['source_languages'])
    print("Target languages:", stats['language_distribution']['target_languages'])
    
    # Test 2: Clear history
    print("\nTest 2: Clear History")
    print("History before clearing:", len(translation_manager.get_translation_history()))
    translation_manager.clear_history()
    print("History after clearing:", len(translation_manager.get_translation_history()))
    
    # Test 3: Confidence score based on text length
    print("\nTest 3: Confidence Score Based on Text Length")
    test_texts = [
        "Hi",  # Short text
        "Hello, how are you?",  # Medium text
        "This is a longer text that should have a higher confidence score in language detection."  # Long text
    ]
    
    for text in test_texts:
        try:
            lang, confidence = translation_manager.detect_language(text)
            print(f"\nText: {text}")
            print(f"Detected language: {translation_manager.get_language_name(lang)}")
            print(f"Confidence: {confidence:.2f}")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_error_handling()
    test_enhanced_features() 