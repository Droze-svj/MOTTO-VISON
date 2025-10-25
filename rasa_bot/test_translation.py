from utils.translation import TranslationManager

def test_translation():
    # Initialize translation manager
    translation_manager = TranslationManager()
    
    # Test 1: Basic translation
    print("\nTest 1: Basic Translation")
    result = translation_manager.translate_text("Hello, how are you?", "es", "en")
    print(f"English to Spanish: {result['translated_text']}")
    
    # Test 2: Language detection
    print("\nTest 2: Language Detection")
    text = "Bonjour, comment allez-vous?"
    detected_lang, confidence = translation_manager.detect_language(text)
    print(f"Detected language: {translation_manager.get_language_name(detected_lang)} (confidence: {confidence:.2f})")
    
    # Test 3: Translation history
    print("\nTest 3: Translation History")
    history = translation_manager.get_translation_history(limit=5)
    print("Recent translations:")
    for entry in history:
        print(f"- From {translation_manager.get_language_name(entry['source_language'])} to {translation_manager.get_language_name(entry['target_language'])}: {entry['translated_text']}")
    
    # Test 4: Translation statistics
    print("\nTest 4: Translation Statistics")
    stats = translation_manager.get_translation_stats()
    print(f"Total translations: {stats['total_translations']}")
    print(f"Successful translations: {stats['successful_translations']}")
    print(f"Failed translations: {stats['failed_translations']}")
    if stats['most_common_source_language']:
        print(f"Most common source language: {translation_manager.get_language_name(stats['most_common_source_language'])}")
    if stats['most_common_target_language']:
        print(f"Most common target language: {translation_manager.get_language_name(stats['most_common_target_language'])}")
    
    # Test 5: Multiple translations
    print("\nTest 5: Multiple Translations")
    texts = [
        ("Hello", "es"),
        ("Good morning", "fr"),
        ("Thank you", "de"),
        ("Goodbye", "it")
    ]
    for text, target_lang in texts:
        result = translation_manager.translate_text(text, target_lang, "en")
        print(f"English to {translation_manager.get_language_name(target_lang)}: {result['translated_text']}")

if __name__ == "__main__":
    test_translation() 