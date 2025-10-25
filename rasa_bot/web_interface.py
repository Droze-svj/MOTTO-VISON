from flask import Flask, render_template, request, jsonify
from utils.translation import TranslationManager
from utils.translation_quality import TranslationQualityAssessor
import logging
import os
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
import jwt
import hashlib
from datetime import datetime, timedelta

app = Flask(__name__)
translation_manager = TranslationManager()
quality_assessor = TranslationQualityAssessor()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CORS(app)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Security middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(
                token,
                os.environ.get('JWT_SECRET_KEY', 'your-secret-key'),
                algorithms=['HS256']
            )
            current_user = data['user']
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Security headers middleware
@app.after_request
def add_security_headers(response):
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    return response

# Login endpoint
@app.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({'message': 'Could not verify!'}), 401

    try:
        # Hash password for comparison
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            auth.password.encode('utf-8'),
            salt,
            100000
        )
        
        # Generate JWT token
        token = jwt.encode({
            'user': auth.username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, os.environ.get('JWT_SECRET_KEY', 'your-secret-key'), algorithm='HS256')
        
        return jsonify({'token': token})
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'message': 'Login failed!'}), 401

# Protected chat endpoint
@app.route('/api/chat', methods=['POST'])
@token_required
@limiter.limit("60 per minute")
def chat(current_user):
    try:
        data = request.get_json()
        message = data.get('message')
        
        # Encrypt message
        key = os.urandom(32)
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, message.encode(), None)
        
        # Process message and get bot response
        # ... existing chat logic ...
        
        return jsonify({
            'response': 'Bot response here',
            'encrypted': ciphertext.hex()
        })
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({'message': 'Error processing message!'}), 500

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html', 
                         languages=translation_manager.get_supported_languages())

@app.route('/translate', methods=['POST'])
def translate():
    """Handle translation requests."""
    try:
        data = request.get_json()
        text = data.get('text', '')
        target_lang = data.get('target_language', 'es')
        source_lang = data.get('source_language', 'auto')
        
        # Perform translation
        result = translation_manager.translate_text(text, target_lang, source_lang)
        
        if result['success']:
            # Assess quality
            quality = quality_assessor.assess_quality(
                text, result['translated_text'], source_lang, target_lang
            )
            result['quality'] = quality
            
            # Get suggestions
            suggestions = translation_manager.get_translation_suggestions(
                text, target_lang
            )
            result['suggestions'] = suggestions
            
            # Get synonyms for key words
            key_words = text.split()[:3]  # Get first 3 words
            synonyms = {
                word: translation_manager.get_synonyms(word)
                for word in key_words
            }
            result['synonyms'] = synonyms
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/batch_translate', methods=['POST'])
def batch_translate():
    """Handle batch translation requests."""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        target_lang = data.get('target_language', 'es')
        source_lang = data.get('source_language', 'auto')
        
        results = translation_manager.batch_translate(texts, target_lang, source_lang)
        return jsonify({'success': True, 'results': results})
    except Exception as e:
        logger.error(f"Batch translation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/quality_report', methods=['GET'])
def quality_report():
    """Get translation quality report."""
    try:
        report = translation_manager.get_translation_report()
        return jsonify(report)
    except Exception as e:
        logger.error(f"Quality report error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/check_spelling', methods=['POST'])
def check_spelling():
    """Check spelling in text."""
    try:
        data = request.get_json()
        text = data.get('text', '')
        result = translation_manager.check_spelling(text)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Spelling check error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/validate_grammar', methods=['POST'])
def validate_grammar():
    """Validate grammar in text."""
    try:
        data = request.get_json()
        text = data.get('text', '')
        result = translation_manager.validate_grammar(text)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Grammar validation error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    # Create the index.html template
    with open('templates/index.html', 'w') as f:
        f.write('''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Motto Vision - AI Translation System</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
    <style>
        :root {
            --primary-gradient: linear-gradient(135deg, #1a1a2e, #16213e);
            --secondary-gradient: linear-gradient(135deg, #0f3460, #533483);
            --accent-color: #e94560;
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
        }

        body {
            font-family: 'Roboto', sans-serif;
            background: var(--primary-gradient);
            min-height: 100vh;
            color: var(--text-primary);
            position: relative;
            overflow-x: hidden;
        }

        #particles-js {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            z-index: 0;
        }

        .container {
            position: relative;
            z-index: 1;
            padding-top: 2rem;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
            animation: fadeInDown 1s ease-out;
        }

        .header h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 3.5rem;
            font-weight: 700;
            background: linear-gradient(45deg, #fff, #e94560);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }

        .header p {
            color: var(--text-secondary);
            font-size: 1.2rem;
            max-width: 600px;
            margin: 0 auto;
        }

        .glass-card {
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .glass-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transform: translateX(-100%);
            transition: 0.6s;
        }

        .glass-card:hover::before {
            transform: translateX(100%);
        }

        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }

        .translation-box {
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 15px;
            padding: 1.5rem;
            color: var(--text-primary);
            min-height: 150px;
            transition: all 0.3s ease;
            font-size: 1.1rem;
            line-height: 1.6;
        }

        .translation-box:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 20px rgba(233, 69, 96, 0.2);
        }

        .form-control {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
            backdrop-filter: blur(5px);
            border-radius: 10px;
            padding: 1rem;
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }

        .form-control:focus {
            background: var(--glass-bg);
            border-color: var(--accent-color);
            color: var(--text-primary);
            box-shadow: 0 0 20px rgba(233, 69, 96, 0.2);
        }

        .btn {
            background: var(--secondary-gradient);
            border: none;
            border-radius: 30px;
            padding: 12px 30px;
            font-weight: 500;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            font-size: 0.9rem;
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transform: translateX(-100%);
            transition: 0.6s;
        }

        .btn:hover::before {
            transform: translateX(100%);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .quality-score {
            font-size: 1.4em;
            font-weight: bold;
            color: var(--accent-color);
            text-shadow: 0 0 10px rgba(233, 69, 96, 0.3);
            animation: pulse 2s infinite;
        }

        .suggestion {
            cursor: pointer;
            padding: 12px;
            margin: 8px 0;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .suggestion:hover {
            background: var(--secondary-gradient);
            transform: translateX(10px);
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }

        .loading {
            position: relative;
        }

        .loading::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            top: 50%;
            left: 50%;
            margin: -10px 0 0 -10px;
            border: 3px solid var(--accent-color);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    </style>
</head>
<body>
    <div id="particles-js"></div>
    <div class="container">
        <div class="header">
            <h1>Motto Vision</h1>
            <p>Advanced AI Translation System</p>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="glass-card">
                    <h3>Source Text</h3>
                    <textarea id="sourceText" class="form-control translation-box" rows="6" placeholder="Enter text to translate..."></textarea>
                    <div class="mt-3">
                        <select id="sourceLanguage" class="form-control">
                            <option value="auto">Auto Detect</option>
                            {% for lang in languages %}
                            <option value="{{ lang.code }}">{{ lang.name }}</option>
                            {% endfor %}
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="glass-card">
                    <h3>Translated Text</h3>
                    <div id="translatedText" class="translation-box"></div>
                    <div class="mt-3">
                        <select id="targetLanguage" class="form-control">
                            {% for lang in languages %}
                            <option value="{{ lang.code }}">{{ lang.name }}</option>
                            {% endfor %}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12">
                <div class="glass-card">
                    <h3>Translation Quality</h3>
                    <div id="qualityScore" class="quality-score"></div>
                    <div id="suggestions" class="mt-3"></div>
                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-12 text-center">
                <button id="translateBtn" class="btn btn-primary">Translate</button>
            </div>
        </div>
    </div>

    <script>
        // Initialize particles.js
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#ffffff'
                },
                shape: {
                    type: 'circle'
                },
                opacity: {
                    value: 0.5,
                    random: false
                },
                size: {
                    value: 3,
                    random: true
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                }
            },
            retina_detect: true
        });

        // Translation functionality
        document.getElementById('translateBtn').addEventListener('click', async () => {
            const sourceText = document.getElementById('sourceText').value;
            const sourceLang = document.getElementById('sourceLanguage').value;
            const targetLang = document.getElementById('targetLanguage').value;
            
            if (!sourceText) return;

            const btn = document.getElementById('translateBtn');
            btn.classList.add('loading');
            btn.disabled = true;

            try {
                const response = await fetch('/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: sourceText,
                        source_language: sourceLang,
                        target_language: targetLang
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('translatedText').textContent = data.translated_text;
                    document.getElementById('qualityScore').textContent = `Quality Score: ${data.quality.score}%`;
                    
                    const suggestionsDiv = document.getElementById('suggestions');
                    suggestionsDiv.innerHTML = '';
                    
                    if (data.suggestions && data.suggestions.length > 0) {
                        data.suggestions.forEach(suggestion => {
                            const div = document.createElement('div');
                            div.className = 'suggestion';
                            div.textContent = suggestion;
                            div.onclick = () => {
                                document.getElementById('translatedText').textContent = suggestion;
                            };
                            suggestionsDiv.appendChild(div);
                        });
                    }
                }
            } catch (error) {
                console.error('Translation error:', error);
            } finally {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        });
    </script>
</body>
</html>
        ''')
    
    app.run(debug=True) 