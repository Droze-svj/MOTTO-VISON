/**
 * Extended Knowledge Service
 * 50+ Additional Free Knowledge Sources
 */

export class ExtendedKnowledgeService {
  private static instance: ExtendedKnowledgeService;

  private constructor() {}

  static getInstance(): ExtendedKnowledgeService {
    if (!ExtendedKnowledgeService.instance) {
      ExtendedKnowledgeService.instance = new ExtendedKnowledgeService();
    }
    return ExtendedKnowledgeService.instance;
  }

  // ============================================
  // EDUCATION & LEARNING (10 sources)
  // ============================================

  // 26. COURSERA - Free course information
  async searchCourses(topic: string) {
    const url = `https://api.coursera.org/api/courses.v1?q=search&query=${encodeURIComponent(topic)}`;
    const response = await fetch(url);
    return response.json();
  }

  // 27. KHAN ACADEMY - Educational content
  async getKhanAcademy(topic: string) {
    // Khan Academy topic tree
    const url = `https://www.khanacademy.org/api/v1/topictree`;
    const response = await fetch(url);
    return response.json();
  }

  // 28. WOLFRAMALPHA - Computational knowledge
  async queryWolfram(query: string, appId?: string) {
    const url = `https://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&appid=${appId || 'DEMO'}&output=json`;
    const response = await fetch(url);
    return response.json();
  }

  // 29. YOUTUBE - Educational videos
  async searchYouTube(query: string, apiKey?: string) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey || 'DEMO'}`;
    const response = await fetch(url);
    return response.json();
  }

  // 30. MEDIUM - Articles & tutorials
  async searchMedium(topic: string) {
    // Medium RSS feed
    const url = `https://medium.com/feed/tag/${topic}`;
    const response = await fetch(url);
    return response.text();
  }

  // 31. DEV.TO - Programming articles
  async getDevToArticles(tag: string) {
    const url = `https://dev.to/api/articles?tag=${tag}&per_page=5`;
    const response = await fetch(url);
    return response.json();
  }

  // 32. REDDIT - Community discussions
  async getRedditPosts(subreddit: string) {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=5`;
    const response = await fetch(url);
    return response.json();
  }

  // 33. QUORA - Q&A platform
  async searchQuora(topic: string) {
    // Quora API requires auth, use RSS as alternative
    const url = `https://www.quora.com/topic/${topic}/rss`;
    const response = await fetch(url);
    return response.text();
  }

  // 34. LEETCODE - Coding problems
  async getLeetCodeProblems(difficulty?: string) {
    const url = `https://leetcode.com/api/problems/all/`;
    const response = await fetch(url);
    return response.json();
  }

  // 35. HACKERRANK - Programming challenges
  async getHackerRankChallenges(track: string) {
    const url = `https://www.hackerrank.com/rest/contests/${track}/challenges`;
    const response = await fetch(url);
    return response.json();
  }

  // ============================================
  // HEALTH & WELLNESS (10 sources)
  // ============================================

  // 36. NUTRITIONIX - Food nutrition data
  async getNutritionInfo(food: string, apiKey?: string) {
    const url = `https://trackapi.nutritionix.com/v2/natural/nutrients`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': apiKey || 'demo',
        'x-app-key': apiKey || 'demo'
      },
      body: JSON.stringify({query: food})
    });
    return response.json();
  }

  // 37. OPEN FOOD FACTS - Product database
  async searchFood(product: string) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(product)}&json=1`;
    const response = await fetch(url);
    return response.json();
  }

  // 38. MEDITATION API - Mindfulness
  async getMeditationExercise() {
    const url = 'https://www.themind.com/api/meditation/random';
    const response = await fetch(url);
    return response.json();
  }

  // 39. YOGA POSES - Yoga information
  async getYogaPoses(difficulty?: string) {
    const url = `https://yoga-api-nzy4.onrender.com/v1/poses${difficulty ? `?level=${difficulty}` : ''}`;
    const response = await fetch(url);
    return response.json();
  }

  // 40. DISEASE INFO - Medical information
  async getDiseaseInfo(disease: string) {
    const url = `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${disease}`;
    const response = await fetch(url);
    return response.json();
  }

  // 41. BMI CALCULATOR - Health metrics
  async calculateBMI(weight: number, height: number) {
    const bmi = weight / ((height / 100) ** 2);
    const category = bmi < 18.5 ? 'Underweight' : 
                    bmi < 25 ? 'Normal' :
                    bmi < 30 ? 'Overweight' : 'Obese';
    return {bmi: bmi.toFixed(1), category};
  }

  // 42. SLEEP CALCULATOR - Sleep cycles
  calculateSleepTime(wakeTime: string) {
    const cycles = [1.5, 3, 4.5, 6, 7.5, 9]; // Hours
    const results = cycles.map(hours => {
      const bedTime = new Date(wakeTime);
      bedTime.setHours(bedTime.getHours() - hours);
      return {cycles: hours / 1.5, time: bedTime.toLocaleTimeString()};
    });
    return results;
  }

  // 43. WATER INTAKE - Hydration calculator
  calculateWaterIntake(weight: number, activityLevel: string) {
    const base = weight * 0.033; // Liters
    const activity = activityLevel === 'high' ? 1 : activityLevel === 'medium' ? 0.5 : 0;
    return {liters: (base + activity).toFixed(1)};
  }

  // 44. CALORIE CALCULATOR - Nutrition
  calculateCalories(weight: number, height: number, age: number, gender: string, activity: string) {
    // Mifflin-St Jeor Equation
    let bmr = gender === 'male'
      ? (10 * weight) + (6.25 * height) - (5 * age) + 5
      : (10 * weight) + (6.25 * height) - (5 * age) - 161;
    
    const multipliers: any = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(bmr * (multipliers[activity] || 1.2))
    };
  }

  // 45. MEDICATION INFO - Drug information
  async getMedicationInfo(drug: string) {
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(drug)}&limit=1`;
    const response = await fetch(url);
    return response.json();
  }

  // ============================================
  // PRODUCTIVITY & TOOLS (10 sources)
  // ============================================

  // 46. TIMEZONE API - Time conversion
  async getTimezone(location: string) {
    const url = `http://worldtimeapi.org/api/timezone/America/${location}`;
    const response = await fetch(url);
    return response.json();
  }

  // 47. QR CODE - Generate QR codes
  async generateQRCode(text: string) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    return {url, text};
  }

  // 48. MARKDOWN to HTML - Text formatting
  async convertMarkdown(markdown: string) {
    // Simple conversion or use API
    return markdown
      .replace(/#{1,6}\s(.+)/g, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  // 49. URL SHORTENER - Short links
  async shortenURL(longUrl: string) {
    const url = `https://cleanuri.com/api/v1/shorten`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({url: longUrl})
    });
    return response.json();
  }

  // 50. UUID GENERATOR - Unique IDs
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 51. PASSWORD GENERATOR - Security
  generatePassword(length: number = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  // 52. COLOR CONVERTER - Design tools
  hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // 53. BASE64 ENCODER/DECODER - Data encoding
  encodeBase64(text: string) {
    return Buffer.from(text).toString('base64');
  }

  decodeBase64(encoded: string) {
    return Buffer.from(encoded, 'base64').toString();
  }

  // 54. JSON FORMATTER - Data formatting
  formatJSON(json: string) {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return 'Invalid JSON';
    }
  }

  // 55. REGEX TESTER - Regular expressions
  testRegex(pattern: string, text: string) {
    try {
      const regex = new RegExp(pattern);
      return {
        matches: text.match(regex),
        isMatch: regex.test(text)
      };
    } catch {
      return {error: 'Invalid regex'};
    }
  }

  // ============================================
  // TRAVEL & GEOGRAPHY (5 sources)
  // ============================================

  // 56. AIRPORT INFO - Flight data
  async getAirportInfo(code: string) {
    const url = `https://aviation-edge.com/v2/public/airportDatabase?codeIataAirport=${code}`;
    const response = await fetch(url);
    return response.json();
  }

  // 57. CITY COORDINATES - Geocoding
  async getCityCoordinates(city: string) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {'User-Agent': 'MOTTO-AI/1.0'}
    });
    return response.json();
  }

  // 58. TIMEZONE BY LOCATION - Time zones
  async getTimezoneByCoords(lat: number, lon: number) {
    const url = `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`;
    const response = await fetch(url);
    return response.json();
  }

  // 59. LANGUAGE DETECTION - Detect language
  async detectLanguage(text: string) {
    // Simple heuristic or use API
    const patterns: any = {
      spanish: /\b(el|la|los|las|un|una|es|está)\b/i,
      french: /\b(le|la|les|un|une|est|sont)\b/i,
      german: /\b(der|die|das|ein|eine|ist|sind)\b/i
    };
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) return lang;
    }
    
    return 'english';
  }

  // 60. TRANSLATION - Free translation
  async translateText(text: string, targetLang: string) {
    // Use LibreTranslate (free, open source)
    const url = 'https://libretranslate.de/translate';
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang
      })
    });
    return response.json();
  }

  // ============================================
  // ENTERTAINMENT & MEDIA (10 sources)
  // ============================================

  // 61. SPOTIFY - Music data (public API)
  async searchMusic(query: string) {
    // Spotify Web API (requires token but has free tier)
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`;
    // Note: Requires OAuth token
    return {note: 'Requires Spotify token'};
  }

  // 62. LAST.FM - Music recommendations
  async getMusicInfo(artist: string, apiKey?: string) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${apiKey || 'demo'}&format=json`;
    const response = await fetch(url);
    return response.json();
  }

  // 63. TV MAZE - TV show information
  async searchTVShow(show: string) {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(show)}`;
    const response = await fetch(url);
    return response.json();
  }

  // 64. GAME DATABASE - Video games
  async searchGames(game: string) {
    const url = `https://www.freetogame.com/api/games?category=${game}`;
    const response = await fetch(url);
    return response.json();
  }

  // 65. ANIME DATABASE - Anime information
  async searchAnime(title: string) {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=5`;
    const response = await fetch(url);
    return response.json();
  }

  // 66. BOOK RECOMMENDATIONS - Reading suggestions
  async getBookRecommendations(genre: string) {
    const url = `https://openlibrary.org/subjects/${genre}.json?limit=10`;
    const response = await fetch(url);
    return response.json();
  }

  // 67. PODCAST SEARCH - Audio content
  async searchPodcasts(query: string) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&limit=5`;
    const response = await fetch(url);
    return response.json();
  }

  // 68. BOARD GAME ATLAS - Games
  async searchBoardGames(name: string) {
    const url = `https://api.boardgameatlas.com/api/search?name=${encodeURIComponent(name)}&limit=5`;
    const response = await fetch(url);
    return response.json();
  }

  // 69. MUSEUM API - Art & culture
  async searchArtwork(query: string) {
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    return response.json();
  }

  // 70. LYRICS - Song lyrics
  async getLyrics(artist: string, song: string) {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
    const response = await fetch(url);
    return response.json();
  }

  // ============================================
  // BUSINESS & FINANCE (5 sources)
  // ============================================

  // 71. STOCK PRICES - Financial data
  async getStockPrice(symbol: string) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(url);
    return response.json();
  }

  // 72. CRYPTO PRICES - Cryptocurrency
  async getCryptoPrice(coin: string) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;
    const response = await fetch(url);
    return response.json();
  }

  // 73. COMPANY INFO - Business data
  async getCompanyInfo(domain: string) {
    const url = `https://company.clearbit.com/v1/domains/find?name=${domain}`;
    const response = await fetch(url);
    return response.json();
  }

  // 74. ECONOMIC DATA - Economic indicators
  async getEconomicData(indicator: string) {
    // Federal Reserve Economic Data (FRED)
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${indicator}&api_key=demo&file_type=json`;
    const response = await fetch(url);
    return response.json();
  }

  // 75. STARTUP DATA - Company information
  async searchStartups(name: string) {
    const url = `https://api.crunchbase.com/api/v4/searches/organizations?query=${name}`;
    // Note: Requires API key but has free tier
    return {note: 'Requires Crunchbase key (free tier available)'};
  }

  // ============================================
  // UTILITIES & TOOLS (10 sources)
  // ============================================

  // 76. IP LOOKUP - Network information
  async getIPInfo(ip?: string) {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    const response = await fetch(url);
    return response.json();
  }

  // 77. DNS LOOKUP - Domain information
  async getDNSInfo(domain: string) {
    const url = `https://dns.google/resolve?name=${domain}`;
    const response = await fetch(url);
    return response.json();
  }

  // 78. LOREM IPSUM - Placeholder text
  generateLoremIpsum(paragraphs: number = 1) {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit...";
    return Array(paragraphs).fill(lorem).join('\n\n');
  }

  // 79. FAKE DATA - Testing data
  async generateFakeUser() {
    const url = 'https://randomuser.me/api/';
    const response = await fetch(url);
    return response.json();
  }

  // 80. EMAIL VALIDATION - Check email format
  validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: regex.test(email),
      domain: email.split('@')[1]
    };
  }

  // 81. PHONE FORMATTER - Format phone numbers
  formatPhoneNumber(phone: string, country: string = 'US') {
    const cleaned = phone.replace(/\D/g, '');
    if (country === 'US' && cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  // 82. DATE CALCULATOR - Date math
  calculateDate(startDate: Date, days: number) {
    const result = new Date(startDate);
    result.setDate(result.getDate() + days);
    return result;
  }

  // 83. AGE CALCULATOR - Calculate age
  calculateAge(birthDate: Date) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // 84. WORD COUNT - Text analysis
  analyzeText(text: string) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    
    return {
      words: words.length,
      characters: chars,
      sentences: sentences,
      avgWordLength: (chars / words.length).toFixed(1),
      readingTime: Math.ceil(words.length / 200) // minutes
    };
  }

  // 85. HASH GENERATOR - Generate hashes
  async generateHash(text: string, algorithm: string = 'SHA-256') {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export default ExtendedKnowledgeService.getInstance();
