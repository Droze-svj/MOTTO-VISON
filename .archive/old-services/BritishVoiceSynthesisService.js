import AsyncStorage from '@react-native-async-storage/async-storage';
import Tts from 'react-native-tts';
import { Platform } from 'react-native';
import MetricsService from './MetricsService';
import EventBus from './EventBus';
import ErrorManager from './ErrorManager';

class BritishVoiceSynthesisService {
  constructor() {
    this.isInitialized = false;
    
    // British voice configurations
    this.britishVoices = {
      // iOS British voices
      ios: {
        'en-GB': {
          name: 'en-GB',
          displayName: 'British English (Default)',
          gender: 'female',
          accent: 'british',
          quality: 'high',
          rate: 0.5,
          pitch: 1.0,
          volume: 1.0
        },
        'en-GB-Daniel': {
          name: 'en-GB-Daniel',
          displayName: 'Daniel (British Male)',
          gender: 'male',
          accent: 'british',
          quality: 'high',
          rate: 0.5,
          pitch: 0.9,
          volume: 1.0
        },
        'en-GB-Kate': {
          name: 'en-GB-Kate',
          displayName: 'Kate (British Female)',
          gender: 'female',
          accent: 'british',
          quality: 'high',
          rate: 0.5,
          pitch: 1.1,
          volume: 1.0
        },
        'en-GB-Oliver': {
          name: 'en-GB-Oliver',
          displayName: 'Oliver (British Male)',
          gender: 'male',
          accent: 'british',
          quality: 'high',
          rate: 0.5,
          pitch: 0.95,
          volume: 1.0
        },
        'en-GB-Serena': {
          name: 'en-GB-Serena',
          displayName: 'Serena (British Female)',
          gender: 'female',
          accent: 'british',
          quality: 'high',
          rate: 0.5,
          pitch: 1.05,
          volume: 1.0
        }
      },
      // Android British voices
      android: {
        'en-GB': {
          name: 'en-GB',
          displayName: 'British English (Default)',
          gender: 'female',
          accent: 'british',
          quality: 'high',
          rate: 0.5,
          pitch: 1.0,
          volume: 1.0
        },
        'en-GB-f1': {
          name: 'en-GB-f1',
          displayName: 'British Female 1',
          gender: 'female',
          accent: 'british',
          quality: 'high',
          rate: 0.5,
          pitch: 1.1,
          volume: 1.0
        },
        'en-GB-f2': {
          name: 'en-GB-f2',
          displayName: 'British Female 2',
          gender: 'female',
          accent: 'british',
          quality: 'high',
          rate: 0.5,
          pitch: 1.05,
          volume: 1.0
        }
      }
    };
    
    // Current voice settings
    this.currentVoice = {
      name: 'en-GB-Kate',
      displayName: 'Kate (British Female)',
      gender: 'female',
      accent: 'british',
      quality: 'high',
      rate: 0.5,
      pitch: 1.1,
      volume: 1.0
    };
    
    // Voice synthesis settings
    this.synthesisSettings = {
      rate: 0.5,        // Speech rate (0.1 - 1.0)
      pitch: 1.1,       // Voice pitch (0.5 - 2.0)
      volume: 1.0,      // Volume (0.0 - 1.0)
      language: 'en-GB', // British English
      quality: 'high',   // Voice quality
      accent: 'british', // British accent
      gender: 'female'   // Female voice
    };
    
    // Speech queue and management
    this.speechQueue = [];
    this.isSpeaking = false;
    this.currentSpeechId = null;
    
    // Voice customization options
    this.voiceCustomizations = {
      // British pronunciation adjustments
      pronunciation: {
        'schedule': 'shed-yool',
        'aluminum': 'aluminium',
        'color': 'colour',
        'favor': 'favour',
        'honor': 'honour',
        'labor': 'labour',
        'neighbor': 'neighbour',
        'rumor': 'rumour',
        'savior': 'saviour',
        'vapor': 'vapour',
        'vigor': 'vigour',
        'center': 'centre',
        'fiber': 'fibre',
        'liter': 'litre',
        'meter': 'metre',
        'theater': 'theatre',
        'mom': 'mum',
        'mommy': 'mummy',
        'candy': 'sweets',
        'cookie': 'biscuit',
        'elevator': 'lift',
        'apartment': 'flat',
        'truck': 'lorry',
        'gas': 'petrol',
        'sidewalk': 'pavement',
        'garbage': 'rubbish',
        'trash': 'rubbish',
        'vacation': 'holiday',
        'fall': 'autumn',
        'soccer': 'football',
        'pants': 'trousers',
        'underwear': 'pants',
        'sweater': 'jumper',
        'sneakers': 'trainers',
        'boots': 'wellies',
        'purse': 'handbag',
        'wallet': 'purse',
        'bathroom': 'loo',
        'restroom': 'loo',
        'toilet': 'loo',
        'phone': 'mobile',
        'cell phone': 'mobile',
        'call': 'ring',
        'call me': 'ring me',
        'hang up': 'ring off',
        'busy': 'engaged',
        'line': 'queue',
        'stand in line': 'queue up',
        'wait in line': 'queue up',
        'ticket': 'fare',
        'one way': 'single',
        'round trip': 'return',
        'subway': 'underground',
        'train': 'tube',
        'railroad': 'railway',
        'ticket office': 'booking office',
        'conductor': 'guard',
        'engineer': 'driver',
        'baggage': 'luggage',
        'suitcase': 'case',
        'backpack': 'rucksack',
        'flashlight': 'torch',
        'battery': 'cell',
        'outlet': 'socket',
        'cord': 'lead',
        'extension cord': 'extension lead',
        'power strip': 'extension lead',
        'faucet': 'tap',
        'sink': 'basin',
        'stove': 'cooker',
        'oven': 'cooker',
        'refrigerator': 'fridge',
        'freezer': 'freezer',
        'dishwasher': 'dishwasher',
        'washing machine': 'washing machine',
        'dryer': 'tumble dryer',
        'clothesline': 'washing line',
        'iron': 'iron',
        'ironing board': 'ironing board',
        'vacuum': 'hoover',
        'vacuum cleaner': 'hoover',
        'broom': 'brush',
        'mop': 'mop',
        'dustpan': 'dustpan',
        'trash can': 'bin',
        'garbage can': 'bin',
        'wastebasket': 'bin',
        'recycling': 'recycling',
        'compost': 'compost',
        'garden': 'garden',
        'yard': 'garden',
        'lawn': 'lawn',
        'grass': 'grass',
        'flower': 'flower',
        'tree': 'tree',
        'bush': 'bush',
        'hedge': 'hedge',
        'fence': 'fence',
        'gate': 'gate',
        'door': 'door',
        'window': 'window',
        'curtain': 'curtain',
        'blind': 'blind',
        'shade': 'blind',
        'lamp': 'lamp',
        'light': 'light',
        'bulb': 'bulb',
        'switch': 'switch',
        'button': 'button',
        'knob': 'knob',
        'handle': 'handle',
        'key': 'key',
        'lock': 'lock',
        'unlock': 'unlock',
        'open': 'open',
        'close': 'close',
        'shut': 'shut',
        'turn on': 'switch on',
        'turn off': 'switch off',
        'put on': 'put on',
        'take off': 'take off',
        'get in': 'get in',
        'get out': 'get out',
        'get on': 'get on',
        'get off': 'get off',
        'get up': 'get up',
        'sit down': 'sit down',
        'stand up': 'stand up',
        'lie down': 'lie down',
        'wake up': 'wake up',
        'go to sleep': 'go to sleep',
        'fall asleep': 'fall asleep',
        'eat': 'eat',
        'drink': 'drink',
        'cook': 'cook',
        'bake': 'bake',
        'fry': 'fry',
        'boil': 'boil',
        'steam': 'steam',
        'grill': 'grill',
        'roast': 'roast',
        'stew': 'stew',
        'soup': 'soup',
        'salad': 'salad',
        'sandwich': 'sandwich',
        'burger': 'burger',
        'pizza': 'pizza',
        'pasta': 'pasta',
        'rice': 'rice',
        'bread': 'bread',
        'butter': 'butter',
        'cheese': 'cheese',
        'milk': 'milk',
        'cream': 'cream',
        'sugar': 'sugar',
        'salt': 'salt',
        'pepper': 'pepper',
        'spice': 'spice',
        'herb': 'herb',
        'garlic': 'garlic',
        'onion': 'onion',
        'tomato': 'tomato',
        'potato': 'potato',
        'carrot': 'carrot',
        'lettuce': 'lettuce',
        'cucumber': 'cucumber',
        'pepper': 'pepper',
        'mushroom': 'mushroom',
        'apple': 'apple',
        'banana': 'banana',
        'orange': 'orange',
        'grape': 'grape',
        'strawberry': 'strawberry',
        'blueberry': 'blueberry',
        'raspberry': 'raspberry',
        'blackberry': 'blackberry',
        'cherry': 'cherry',
        'peach': 'peach',
        'pear': 'pear',
        'plum': 'plum',
        'lemon': 'lemon',
        'lime': 'lime',
        'grapefruit': 'grapefruit',
        'watermelon': 'watermelon',
        'melon': 'melon',
        'pineapple': 'pineapple',
        'mango': 'mango',
        'kiwi': 'kiwi',
        'papaya': 'papaya',
        'coconut': 'coconut',
        'avocado': 'avocado',
        'olive': 'olive',
        'nut': 'nut',
        'almond': 'almond',
        'walnut': 'walnut',
        'pecan': 'pecan',
        'hazelnut': 'hazelnut',
        'pistachio': 'pistachio',
        'cashew': 'cashew',
        'peanut': 'peanut',
        'sunflower seed': 'sunflower seed',
        'pumpkin seed': 'pumpkin seed',
        'sesame seed': 'sesame seed',
        'poppy seed': 'poppy seed',
        'flax seed': 'flax seed',
        'chia seed': 'chia seed',
        'quinoa': 'quinoa',
        'oats': 'oats',
        'barley': 'barley',
        'wheat': 'wheat',
        'corn': 'corn',
        'soy': 'soy',
        'tofu': 'tofu',
        'tempeh': 'tempeh',
        'seitan': 'seitan',
        'chicken': 'chicken',
        'beef': 'beef',
        'pork': 'pork',
        'lamb': 'lamb',
        'fish': 'fish',
        'salmon': 'salmon',
        'tuna': 'tuna',
        'cod': 'cod',
        'haddock': 'haddock',
        'plaice': 'plaice',
        'sole': 'sole',
        'mackerel': 'mackerel',
        'herring': 'herring',
        'sardine': 'sardine',
        'anchovy': 'anchovy',
        'shrimp': 'prawn',
        'lobster': 'lobster',
        'crab': 'crab',
        'mussel': 'mussel',
        'oyster': 'oyster',
        'scallop': 'scallop',
        'squid': 'squid',
        'octopus': 'octopus',
        'egg': 'egg',
        'yolk': 'yolk',
        'white': 'white',
        'shell': 'shell',
        'boiled': 'boiled',
        'fried': 'fried',
        'scrambled': 'scrambled',
        'poached': 'poached',
        'omelet': 'omelette',
        'frittata': 'frittata',
        'quiche': 'quiche',
        'souffle': 'soufflé',
        'custard': 'custard',
        'pudding': 'pudding',
        'dessert': 'dessert',
        'cake': 'cake',
        'pie': 'pie',
        'tart': 'tart',
        'cookie': 'biscuit',
        'cracker': 'cracker',
        'biscuit': 'biscuit',
        'scone': 'scone',
        'muffin': 'muffin',
        'cupcake': 'cupcake',
        'donut': 'doughnut',
        'bagel': 'bagel',
        'croissant': 'croissant',
        'pastry': 'pastry',
        'danish': 'danish',
        'strudel': 'strudel',
        'cannoli': 'cannoli',
        'tiramisu': 'tiramisu',
        'cheesecake': 'cheesecake',
        'brownie': 'brownie',
        'fudge': 'fudge',
        'toffee': 'toffee',
        'caramel': 'caramel',
        'chocolate': 'chocolate',
        'vanilla': 'vanilla',
        'strawberry': 'strawberry',
        'mint': 'mint',
        'coffee': 'coffee',
        'espresso': 'espresso',
        'cappuccino': 'cappuccino',
        'latte': 'latte',
        'mocha': 'mocha',
        'americano': 'americano',
        'macchiato': 'macchiato',
        'frappuccino': 'frappuccino',
        'tea': 'tea',
        'black tea': 'black tea',
        'green tea': 'green tea',
        'white tea': 'white tea',
        'oolong tea': 'oolong tea',
        'pu-erh tea': 'pu-erh tea',
        'herbal tea': 'herbal tea',
        'chamomile': 'chamomile',
        'peppermint': 'peppermint',
        'ginger': 'ginger',
        'lemon': 'lemon',
        'honey': 'honey',
        'sugar': 'sugar',
        'milk': 'milk',
        'cream': 'cream',
        'lemon': 'lemon',
        'lime': 'lime',
        'orange': 'orange',
        'grapefruit': 'grapefruit',
        'cranberry': 'cranberry',
        'apple': 'apple',
        'pear': 'pear',
        'peach': 'peach',
        'apricot': 'apricot',
        'plum': 'plum',
        'cherry': 'cherry',
        'berry': 'berry',
        'strawberry': 'strawberry',
        'raspberry': 'raspberry',
        'blackberry': 'blackberry',
        'blueberry': 'blueberry',
        'elderberry': 'elderberry',
        'gooseberry': 'gooseberry',
        'currant': 'currant',
        'grape': 'grape',
        'wine': 'wine',
        'red wine': 'red wine',
        'white wine': 'white wine',
        'rosé wine': 'rosé wine',
        'sparkling wine': 'sparkling wine',
        'champagne': 'champagne',
        'prosecco': 'prosecco',
        'cava': 'cava',
        'beer': 'beer',
        'ale': 'ale',
        'lager': 'lager',
        'stout': 'stout',
        'porter': 'porter',
        'ipa': 'IPA',
        'pale ale': 'pale ale',
        'brown ale': 'brown ale',
        'mild': 'mild',
        'bitter': 'bitter',
        'cider': 'cider',
        'perry': 'perry',
        'mead': 'mead',
        'whisky': 'whisky',
        'whiskey': 'whiskey',
        'scotch': 'scotch',
        'bourbon': 'bourbon',
        'rye': 'rye',
        'irish': 'irish',
        'canadian': 'canadian',
        'japanese': 'japanese',
        'gin': 'gin',
        'vodka': 'vodka',
        'rum': 'rum',
        'tequila': 'tequila',
        'brandy': 'brandy',
        'cognac': 'cognac',
        'armagnac': 'armagnac',
        'calvados': 'calvados',
        'grappa': 'grappa',
        'schnapps': 'schnapps',
        'liqueur': 'liqueur',
        'amaretto': 'amaretto',
        'baileys': 'Baileys',
        'kahlua': 'Kahlua',
        'cointreau': 'Cointreau',
        'grand marnier': 'Grand Marnier',
        'sambuca': 'sambuca',
        'ouzo': 'ouzo',
        'absinthe': 'absinthe',
        'vermouth': 'vermouth',
        'campari': 'Campari',
        'aperol': 'Aperol',
        'chartreuse': 'Chartreuse',
        'benedictine': 'Bénédictine',
        'drambuie': 'Drambuie',
        'irish cream': 'Irish cream',
        'coffee liqueur': 'coffee liqueur',
        'chocolate liqueur': 'chocolate liqueur',
        'vanilla liqueur': 'vanilla liqueur',
        'coconut liqueur': 'coconut liqueur',
        'orange liqueur': 'orange liqueur',
        'lemon liqueur': 'lemon liqueur',
        'lime liqueur': 'lime liqueur',
        'cherry liqueur': 'cherry liqueur',
        'raspberry liqueur': 'raspberry liqueur',
        'strawberry liqueur': 'strawberry liqueur',
        'blackberry liqueur': 'blackberry liqueur',
        'elderflower liqueur': 'elderflower liqueur',
        'rose liqueur': 'rose liqueur',
        'lavender liqueur': 'lavender liqueur',
        'violet liqueur': 'violet liqueur',
        'pansy liqueur': 'pansy liqueur',
        'dandelion liqueur': 'dandelion liqueur',
        'nettle liqueur': 'nettle liqueur',
        'mint liqueur': 'mint liqueur',
        'basil liqueur': 'basil liqueur',
        'thyme liqueur': 'thyme liqueur',
        'rosemary liqueur': 'rosemary liqueur',
        'sage liqueur': 'sage liqueur',
        'oregano liqueur': 'oregano liqueur',
        'marjoram liqueur': 'marjoram liqueur',
        'tarragon liqueur': 'tarragon liqueur',
        'dill liqueur': 'dill liqueur',
        'fennel liqueur': 'fennel liqueur',
        'anise liqueur': 'anise liqueur',
        'caraway liqueur': 'caraway liqueur',
        'cumin liqueur': 'cumin liqueur',
        'coriander liqueur': 'coriander liqueur',
        'cardamom liqueur': 'cardamom liqueur',
        'cinnamon liqueur': 'cinnamon liqueur',
        'clove liqueur': 'clove liqueur',
        'nutmeg liqueur': 'nutmeg liqueur',
        'allspice liqueur': 'allspice liqueur',
        'ginger liqueur': 'ginger liqueur',
        'galangal liqueur': 'galangal liqueur',
        'turmeric liqueur': 'turmeric liqueur',
        'saffron liqueur': 'saffron liqueur',
        'vanilla liqueur': 'vanilla liqueur',
        'tonka bean liqueur': 'tonka bean liqueur',
        'coffee liqueur': 'coffee liqueur',
        'cacao liqueur': 'cacao liqueur',
        'chocolate liqueur': 'chocolate liqueur',
        'caramel liqueur': 'caramel liqueur',
        'toffee liqueur': 'toffee liqueur',
        'butterscotch liqueur': 'butterscotch liqueur',
        'honey liqueur': 'honey liqueur',
        'maple liqueur': 'maple liqueur',
        'agave liqueur': 'agave liqueur',
        'coconut liqueur': 'coconut liqueur',
        'palm liqueur': 'palm liqueur',
        'date liqueur': 'date liqueur',
        'fig liqueur': 'fig liqueur',
        'prune liqueur': 'prune liqueur',
        'raisin liqueur': 'raisin liqueur',
        'grape liqueur': 'grape liqueur',
        'wine liqueur': 'wine liqueur',
        'port liqueur': 'port liqueur',
        'sherry liqueur': 'sherry liqueur',
        'madeira liqueur': 'madeira liqueur',
        'marsala liqueur': 'marsala liqueur',
        'vermouth liqueur': 'vermouth liqueur',
        'campari liqueur': 'Campari liqueur',
        'aperol liqueur': 'Aperol liqueur',
        'chartreuse liqueur': 'Chartreuse liqueur',
        'benedictine liqueur': 'Bénédictine liqueur',
        'drambuie liqueur': 'Drambuie liqueur',
        'irish cream liqueur': 'Irish cream liqueur',
        'baileys liqueur': 'Baileys liqueur',
        'kahlua liqueur': 'Kahlua liqueur',
        'cointreau liqueur': 'Cointreau liqueur',
        'grand marnier liqueur': 'Grand Marnier liqueur',
        'sambuca liqueur': 'sambuca liqueur',
        'ouzo liqueur': 'ouzo liqueur',
        'absinthe liqueur': 'absinthe liqueur',
        'vermouth liqueur': 'vermouth liqueur',
        'campari liqueur': 'Campari liqueur',
        'aperol liqueur': 'Aperol liqueur',
        'chartreuse liqueur': 'Chartreuse liqueur',
        'benedictine liqueur': 'Bénédictine liqueur',
        'drambuie liqueur': 'Drambuie liqueur',
        'irish cream liqueur': 'Irish cream liqueur',
        'baileys liqueur': 'Baileys liqueur',
        'kahlua liqueur': 'Kahlua liqueur',
        'cointreau liqueur': 'Cointreau liqueur',
        'grand marnier liqueur': 'Grand Marnier liqueur',
        'sambuca liqueur': 'sambuca liqueur',
        'ouzo liqueur': 'ouzo liqueur',
        'absinthe liqueur': 'absinthe liqueur'
      }
    };
    
    // Voice performance metrics
    this.voiceMetrics = {
      totalSpeeches: 0,
      averageSpeechLength: 0,
      averageSpeechTime: 0,
      userSatisfaction: 0,
      voiceQuality: 0,
      pronunciationAccuracy: 0
    };
    
    // Learning system for voice preferences
    this.learningSystem = {
      userPreferences: new Map(),
      voicePatterns: new Map(),
      pronunciationCorrections: new Map(),
      feedbackHistory: []
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize TTS
      await Tts.setDefaultRate(this.synthesisSettings.rate);
      await Tts.setDefaultPitch(this.synthesisSettings.pitch);
      await Tts.setDefaultLanguage(this.synthesisSettings.language);
      
      // Get available voices
      const voices = await Tts.voices();
      await this.analyzeAvailableVoices(voices);
      
      // Set up TTS event listeners
      Tts.addEventListener('tts-start', this.handleTtsStart.bind(this));
      Tts.addEventListener('tts-finish', this.handleTtsFinish.bind(this));
      Tts.addEventListener('tts-cancel', this.handleTtsCancel.bind(this));
      Tts.addEventListener('tts-error', this.handleTtsError.bind(this));
      
      // Load user preferences
      await this.loadUserPreferences();
      
      // Set default British female voice
      await this.setVoice('en-GB-Kate');
      
      this.isInitialized = true;
      console.log('British Voice Synthesis Service initialized successfully');
    } catch (error) {
      console.error('Error initializing British Voice Synthesis Service:', error);
      await ErrorManager.handleError(error, { context: 'BritishVoiceSynthesisService.initialize' });
    }
  }

  async analyzeAvailableVoices(voices) {
    const availableVoices = {
      ios: [],
      android: []
    };
    
    for (const voice of voices) {
      if (voice.language.startsWith('en-GB')) {
        if (Platform.OS === 'ios') {
          availableVoices.ios.push(voice);
        } else {
          availableVoices.android.push(voice);
        }
      }
    }
    
    // Update available voices based on platform
    if (Platform.OS === 'ios') {
      this.availableVoices = availableVoices.ios;
    } else {
      this.availableVoices = availableVoices.android;
    }
    
    console.log('Available British voices:', this.availableVoices);
  }

  async setVoice(voiceName) {
    try {
      const voice = this.britishVoices[Platform.OS][voiceName];
      if (!voice) {
        throw new Error(`Voice ${voiceName} not found`);
      }
      
      this.currentVoice = voice;
      
      // Apply voice settings
      await Tts.setDefaultRate(voice.rate);
      await Tts.setDefaultPitch(voice.pitch);
      await Tts.setDefaultLanguage(voice.name);
      
      // Save user preference
      await this.saveUserPreference('voice', voiceName);
      
      console.log(`Voice set to: ${voice.displayName}`);
      
      // Emit voice change event
      await EventBus.emit('voice_changed', {
        voice: voice,
        timestamp: Date.now()
      });
      
      return voice;
    } catch (error) {
      console.error('Error setting voice:', error);
      throw error;
    }
  }

  async speak(text, options = {}) {
    const startTime = Date.now();
    
    try {
      // Apply British pronunciation adjustments
      const britishText = this.applyBritishPronunciation(text);
      
      // Merge options with current voice settings
      const speechOptions = {
        ...this.synthesisSettings,
        ...options,
        language: this.currentVoice.name,
        rate: options.rate || this.currentVoice.rate,
        pitch: options.pitch || this.currentVoice.pitch,
        volume: options.volume || this.currentVoice.volume
      };
      
      // Add to speech queue
      const speechId = this.generateSpeechId();
      const speechItem = {
        id: speechId,
        text: britishText,
        originalText: text,
        options: speechOptions,
        timestamp: Date.now(),
        startTime: null,
        endTime: null,
        duration: 0
      };
      
      this.speechQueue.push(speechItem);
      await this.processSpeechQueue();
      
      // Update metrics
      this.updateVoiceMetrics(speechItem, Date.now() - startTime);
      
      return speechId;
    } catch (error) {
      console.error('Error speaking text:', error);
      await ErrorManager.handleError(error, { context: 'BritishVoiceSynthesisService.speak' });
      throw error;
    }
  }

  applyBritishPronunciation(text) {
    let britishText = text;
    
    // Apply pronunciation adjustments
    for (const [american, british] of Object.entries(this.voiceCustomizations.pronunciation)) {
      const regex = new RegExp(`\\b${american}\\b`, 'gi');
      britishText = britishText.replace(regex, british);
    }
    
    // Apply British spelling corrections
    britishText = britishText.replace(/\bcolor\b/gi, 'colour');
    britishText = britishText.replace(/\bfavor\b/gi, 'favour');
    britishText = britishText.replace(/\bhonor\b/gi, 'honour');
    britishText = britishText.replace(/\blabor\b/gi, 'labour');
    britishText = britishText.replace(/\bneighbor\b/gi, 'neighbour');
    britishText = britishText.replace(/\brumor\b/gi, 'rumour');
    britishText = britishText.replace(/\bsavior\b/gi, 'saviour');
    britishText = britishText.replace(/\bvapor\b/gi, 'vapour');
    britishText = britishText.replace(/\bvigor\b/gi, 'vigour');
    britishText = britishText.replace(/\bcenter\b/gi, 'centre');
    britishText = britishText.replace(/\bfiber\b/gi, 'fibre');
    britishText = britishText.replace(/\bliter\b/gi, 'litre');
    britishText = britishText.replace(/\bmeter\b/gi, 'metre');
    britishText = britishText.replace(/\btheater\b/gi, 'theatre');
    britishText = britishText.replace(/\baluminum\b/gi, 'aluminium');
    
    return britishText;
  }

  async processSpeechQueue() {
    if (this.isSpeaking || this.speechQueue.length === 0) return;
    
    this.isSpeaking = true;
    const speechItem = this.speechQueue.shift();
    
    try {
      speechItem.startTime = Date.now();
      this.currentSpeechId = speechItem.id;
      
      await Tts.speak(speechItem.text, speechItem.options);
      
      // Wait for speech to complete
      await this.waitForSpeechCompletion(speechItem);
      
    } catch (error) {
      console.error('Error processing speech:', error);
      this.isSpeaking = false;
      this.currentSpeechId = null;
      await this.processSpeechQueue();
    }
  }

  async waitForSpeechCompletion(speechItem) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isSpeaking) {
          clearInterval(checkInterval);
          speechItem.endTime = Date.now();
          speechItem.duration = speechItem.endTime - speechItem.startTime;
          resolve();
        }
      }, 100);
    });
  }

  handleTtsStart(event) {
    console.log('TTS started:', event);
  }

  handleTtsFinish(event) {
    console.log('TTS finished:', event);
    this.isSpeaking = false;
    this.currentSpeechId = null;
    this.processSpeechQueue();
  }

  handleTtsCancel(event) {
    console.log('TTS cancelled:', event);
    this.isSpeaking = false;
    this.currentSpeechId = null;
    this.processSpeechQueue();
  }

  handleTtsError(event) {
    console.error('TTS error:', event);
    this.isSpeaking = false;
    this.currentSpeechId = null;
    this.processSpeechQueue();
  }

  async stopSpeaking() {
    try {
      await Tts.stop();
      this.isSpeaking = false;
      this.currentSpeechId = null;
      this.speechQueue = [];
      console.log('Speech stopped');
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  async pauseSpeaking() {
    try {
      await Tts.pause();
      console.log('Speech paused');
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  }

  async resumeSpeaking() {
    try {
      await Tts.resume();
      console.log('Speech resumed');
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  }

  async setSpeechRate(rate) {
    try {
      await Tts.setDefaultRate(rate);
      this.synthesisSettings.rate = rate;
      this.currentVoice.rate = rate;
      await this.saveUserPreference('rate', rate);
      console.log(`Speech rate set to: ${rate}`);
    } catch (error) {
      console.error('Error setting speech rate:', error);
    }
  }

  async setSpeechPitch(pitch) {
    try {
      await Tts.setDefaultPitch(pitch);
      this.synthesisSettings.pitch = pitch;
      this.currentVoice.pitch = pitch;
      await this.saveUserPreference('pitch', pitch);
      console.log(`Speech pitch set to: ${pitch}`);
    } catch (error) {
      console.error('Error setting speech pitch:', error);
    }
  }

  async setSpeechVolume(volume) {
    try {
      await Tts.setDefaultVolume(volume);
      this.synthesisSettings.volume = volume;
      this.currentVoice.volume = volume;
      await this.saveUserPreference('volume', volume);
      console.log(`Speech volume set to: ${volume}`);
    } catch (error) {
      console.error('Error setting speech volume:', error);
    }
  }

  getAvailableVoices() {
    return this.britishVoices[Platform.OS] || {};
  }

  getCurrentVoice() {
    return this.currentVoice;
  }

  getVoiceSettings() {
    return this.synthesisSettings;
  }

  updateVoiceMetrics(speechItem, processingTime) {
    this.voiceMetrics.totalSpeeches++;
    this.voiceMetrics.averageSpeechLength = 
      (this.voiceMetrics.averageSpeechLength + speechItem.text.length) / 2;
    this.voiceMetrics.averageSpeechTime = 
      (this.voiceMetrics.averageSpeechTime + processingTime) / 2;
  }

  async saveUserPreference(key, value) {
    try {
      const preferences = await this.getUserPreferences();
      preferences[key] = value;
      await AsyncStorage.setItem('british_voice_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preference:', error);
    }
  }

  async getUserPreferences() {
    try {
      const stored = await AsyncStorage.getItem('british_voice_preferences');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }

  async loadUserPreferences() {
    try {
      const preferences = await this.getUserPreferences();
      
      if (preferences.voice) {
        await this.setVoice(preferences.voice);
      }
      
      if (preferences.rate) {
        await this.setSpeechRate(preferences.rate);
      }
      
      if (preferences.pitch) {
        await this.setSpeechPitch(preferences.pitch);
      }
      
      if (preferences.volume) {
        await this.setSpeechVolume(preferences.volume);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }

  generateSpeechId() {
    return `speech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getHealthStatus() {
    return {
      isInitialized: this.isInitialized,
      currentVoice: this.currentVoice,
      synthesisSettings: this.synthesisSettings,
      voiceMetrics: this.voiceMetrics,
      availableVoices: this.availableVoices?.length || 0,
      speechQueue: this.speechQueue.length,
      isSpeaking: this.isSpeaking,
      learningSystem: {
        userPreferences: this.learningSystem.userPreferences.size,
        voicePatterns: this.learningSystem.voicePatterns.size,
        pronunciationCorrections: this.learningSystem.pronunciationCorrections.size,
        feedbackHistory: this.learningSystem.feedbackHistory.length
      }
    };
  }
}

export default new BritishVoiceSynthesisService();
