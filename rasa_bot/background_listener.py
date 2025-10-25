import speech_recognition as sr
import threading
import time
from rasa.core.agent import Agent
from rasa.core.interpreter import RasaNLUInterpreter
from rasa.core.utils import EndpointConfig
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BackgroundListener:
    def __init__(self, model_path):
        self.recognizer = sr.Recognizer()
        self.agent = None
        self.is_listening = True
        self.activation_phrases = ["hey assistant", "hey bot", "hello assistant"]
        self.load_agent(model_path)

    def load_agent(self, model_path):
        """Load the Rasa agent"""
        try:
            interpreter = RasaNLUInterpreter(model_path)
            action_endpoint = EndpointConfig(url="http://localhost:5055/webhook")
            self.agent = Agent.load(model_path, interpreter=interpreter, action_endpoint=action_endpoint)
            logger.info("Agent loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load agent: {e}")
            raise

    def listen_for_activation(self):
        """Listen for the activation phrase"""
        with sr.Microphone() as source:
            logger.info("Adjusting for ambient noise...")
            self.recognizer.adjust_for_ambient_noise(source)
            logger.info("Listening for activation phrase...")

            while self.is_listening:
                try:
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
                    text = self.recognizer.recognize_google(audio).lower()
                    logger.info(f"Heard: {text}")

                    if any(phrase in text for phrase in self.activation_phrases):
                        logger.info("Activation phrase detected!")
                        self.handle_conversation()
                except sr.WaitTimeoutError:
                    continue
                except sr.UnknownValueError:
                    continue
                except Exception as e:
                    logger.error(f"Error in speech recognition: {e}")
                    continue

    def handle_conversation(self):
        """Handle the conversation after activation"""
        logger.info("Starting conversation...")
        with sr.Microphone() as source:
            try:
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                text = self.recognizer.recognize_google(audio)
                logger.info(f"User said: {text}")

                # Process the message with Rasa
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                responses = loop.run_until_complete(self.agent.handle_text(text))
                
                for response in responses:
                    if 'text' in response:
                        logger.info(f"Bot: {response['text']}")
                        # Here you could add text-to-speech to speak the response
                
            except sr.WaitTimeoutError:
                logger.info("No speech detected within timeout")
            except sr.UnknownValueError:
                logger.info("Could not understand audio")
            except Exception as e:
                logger.error(f"Error in conversation: {e}")

    def start(self):
        """Start the background listener"""
        listener_thread = threading.Thread(target=self.listen_for_activation)
        listener_thread.daemon = True
        listener_thread.start()
        logger.info("Background listener started")

    def stop(self):
        """Stop the background listener"""
        self.is_listening = False
        logger.info("Background listener stopped")

if __name__ == "__main__":
    # Initialize and start the background listener
    listener = BackgroundListener("models/20250615-110113-weary-castle.tar.gz")
    listener.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        listener.stop()
        print("\nStopping background listener...") 