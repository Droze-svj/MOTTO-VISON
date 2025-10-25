/**
 * Advanced Collection Service
 * Collects knowledge from 20+ free sources
 */

export class AdvancedCollectionService {
  private static instance: AdvancedCollectionService;
  
  private constructor() {}
  
  static getInstance(): AdvancedCollectionService {
    if (!AdvancedCollectionService.instance) {
      AdvancedCollectionService.instance = new AdvancedCollectionService();
    }
    return AdvancedCollectionService.instance;
  }

  // ============================================
  // KNOWLEDGE SOURCES (20+ Free APIs)
  // ============================================

  // 1. WIKIPEDIA - General Knowledge
  async getWikipedia(topic: string) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
    const response = await fetch(url);
    return response.json();
  }

  // 2. WIKIDATA - Structured Data
  async getWikidata(query: string) {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${query}&language=en&format=json`;
    const response = await fetch(url);
    return response.json();
  }

  // 3. DICTIONARY - Word Definitions
  async getDictionary(word: string) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    const response = await fetch(url);
    return response.json();
  }

  // 4. OPEN LIBRARY - Books & Literature
  async searchBooks(query: string) {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`;
    const response = await fetch(url);
    return response.json();
  }

  // 5. ARXIV - Scientific Papers
  async searchScientificPapers(topic: string) {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(topic)}&start=0&max_results=5`;
    const response = await fetch(url);
    const text = await response.text();
    return this.parseArxivXML(text);
  }

  // 6. GITHUB - Code Examples & Repos
  async searchGitHub(query: string) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=5`;
    const response = await fetch(url);
    return response.json();
  }

  // 7. STACK OVERFLOW - Programming Q&A
  async searchStackOverflow(query: string) {
    const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow`;
    const response = await fetch(url);
    return response.json();
  }

  // 8. NEWS API - Current Events
  async getNews(topic: string) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&language=en&apiKey=DEMO_KEY`;
    const response = await fetch(url);
    return response.json();
  }

  // 9. OPEN WEATHER - Weather Data
  async getWeather(city: string, apiKey?: string) {
    const key = apiKey || 'demo'; // Free tier available
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;
    const response = await fetch(url);
    return response.json();
  }

  // 10. REST COUNTRIES - Geography
  async getCountryInfo(country: string) {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`;
    const response = await fetch(url);
    return response.json();
  }

  // 11. QUOTABLE - Quotes & Inspiration
  async getRandomQuote(tag?: string) {
    const url = tag 
      ? `https://api.quotable.io/random?tags=${tag}`
      : 'https://api.quotable.io/random';
    const response = await fetch(url);
    return response.json();
  }

  // 12. RECIPE API - Cooking
  async searchRecipes(ingredient: string) {
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
    const response = await fetch(url);
    return response.json();
  }

  // 13. EXERCISES - Fitness
  async getExercises(muscle?: string) {
    const url = muscle
      ? `https://wger.de/api/v2/exercise/?muscles=${muscle}&language=2`
      : 'https://wger.de/api/v2/exercise/?language=2&limit=20';
    const response = await fetch(url);
    return response.json();
  }

  // 14. NUMBERS API - Fun Facts
  async getNumberFact(number: number) {
    const url = `http://numbersapi.com/${number}`;
    const response = await fetch(url);
    return response.text();
  }

  // 15. ASTRONOMY - Space Data
  async getSpaceInfo(date?: string) {
    const url = date
      ? `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${date}`
      : 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
    const response = await fetch(url);
    return response.json();
  }

  // 16. CURRENCY EXCHANGE - Financial
  async getExchangeRate(from: string, to: string) {
    const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
    const response = await fetch(url);
    const data = await response.json();
    return {rate: data.rates[to], from, to};
  }

  // 17. TRIVIA - General Knowledge Quiz
  async getTrivia(category?: string) {
    const url = category
      ? `https://opentdb.com/api.php?amount=1&category=${category}`
      : 'https://opentdb.com/api.php?amount=1';
    const response = await fetch(url);
    return response.json();
  }

  // 18. URBAN DICTIONARY - Slang & Modern Terms
  async getUrbanDefinition(term: string) {
    const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`;
    const response = await fetch(url);
    return response.json();
  }

  // 19. POETRY DB - Poems & Literature
  async getPoem(author?: string) {
    const url = author
      ? `https://poetrydb.org/author/${encodeURIComponent(author)}`
      : 'https://poetrydb.org/random';
    const response = await fetch(url);
    return response.json();
  }

  // 20. COCKTAIL DB - Recipes & Drinks
  async searchCocktail(name: string) {
    const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`;
    const response = await fetch(url);
    return response.json();
  }

  // 21. ADVICE SLIP - Random Advice
  async getAdvice() {
    const url = 'https://api.adviceslip.com/advice';
    const response = await fetch(url);
    return response.json();
  }

  // 22. CHUCK NORRIS JOKES - Humor
  async getJoke() {
    const url = 'https://api.chucknorris.io/jokes/random';
    const response = await fetch(url);
    return response.json();
  }

  // 23. RANDOM USER - Generate fake data for examples
  async getRandomUser() {
    const url = 'https://randomuser.me/api/';
    const response = await fetch(url);
    return response.json();
  }

  // 24. AGIFY - Predict age from name
  async predictAge(name: string) {
    const url = `https://api.agify.io?name=${name}`;
    const response = await fetch(url);
    return response.json();
  }

  // 25. DOG/CAT FACTS - Animal Information
  async getDogFact() {
    const url = 'https://dog-api.kinduff.com/api/facts';
    const response = await fetch(url);
    return response.json();
  }

  async getCatFact() {
    const url = 'https://catfact.ninja/fact';
    const response = await fetch(url);
    return response.json();
  }

  // ============================================
  // INTELLIGENT ROUTING
  // ============================================

  async smartCollect(userInput: string): Promise<any> {
    const input = userInput.toLowerCase();
    
    // Route to appropriate source based on query
    if (input.match(/what is|tell me about|explain/)) {
      return await this.getWikipedia(userInput);
    }
    
    if (input.match(/define|definition|meaning/)) {
      const word = this.extractMainWord(userInput);
      return await this.getDictionary(word);
    }
    
    if (input.match(/book|read|author|novel/)) {
      return await this.searchBooks(userInput);
    }
    
    if (input.match(/code|programming|github|repository/)) {
      return await this.searchGitHub(userInput);
    }
    
    if (input.match(/paper|research|study|scientific/)) {
      return await this.searchScientificPapers(userInput);
    }
    
    if (input.match(/weather|temperature|forecast/)) {
      const city = this.extractLocation(userInput);
      return await this.getWeather(city);
    }
    
    if (input.match(/news|latest|current events|happening/)) {
      return await this.getNews(userInput);
    }
    
    if (input.match(/country|capital|population|geography/)) {
      const country = this.extractCountry(userInput);
      return await this.getCountryInfo(country);
    }
    
    if (input.match(/recipe|cook|ingredient|meal/)) {
      const ingredient = this.extractIngredient(userInput);
      return await this.searchRecipes(ingredient);
    }
    
    if (input.match(/exercise|workout|fitness|muscle/)) {
      return await this.getExercises();
    }
    
    if (input.match(/joke|funny|humor/)) {
      return await this.getJoke();
    }
    
    if (input.match(/advice|wisdom|tip/)) {
      return await this.getAdvice();
    }
    
    if (input.match(/poem|poetry|verse/)) {
      return await this.getPoem();
    }
    
    if (input.match(/space|astronomy|nasa|planet/)) {
      return await this.getSpaceInfo();
    }
    
    if (input.match(/exchange|currency|convert.*to/)) {
      const {from, to} = this.extractCurrencies(userInput);
      return await this.getExchangeRate(from, to);
    }
    
    // Default to Wikipedia
    return await this.getWikipedia(userInput);
  }

  // ============================================
  // EXTRACTION UTILITIES
  // ============================================

  private extractMainWord(text: string): string {
    const words = text.split(' ').filter(w => 
      w.length > 3 && !['what', 'does', 'mean', 'define', 'is', 'the'].includes(w.toLowerCase())
    );
    return words[0] || text;
  }

  private extractLocation(text: string): string {
    // Simple extraction - can be enhanced
    const words = text.split(' ');
    const locationIndex = words.findIndex(w => 
      ['in', 'at', 'for'].includes(w.toLowerCase())
    );
    return locationIndex >= 0 ? words[locationIndex + 1] : 'London';
  }

  private extractCountry(text: string): string {
    const words = text.split(' ');
    return words[words.length - 1] || 'USA';
  }

  private extractIngredient(text: string): string {
    const words = text.split(' ');
    const withIndex = words.findIndex(w => w.toLowerCase() === 'with');
    return withIndex >= 0 ? words[withIndex + 1] : words[words.length - 1];
  }

  private extractCurrencies(text: string): {from: string; to: string} {
    const match = text.match(/(\w{3})\s+to\s+(\w{3})/i);
    return match ? {from: match[1].toUpperCase(), to: match[2].toUpperCase()} : {from: 'USD', to: 'EUR'};
  }

  private parseArxivXML(xml: string): any {
    // Simple XML parsing for ArXiv
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
    return entries.slice(0, 5).map(entry => {
      const title = entry.match(/<title>(.*?)<\/title>/)?.[1];
      const summary = entry.match(/<summary>(.*?)<\/summary>/)?.[1];
      return {title, summary};
    });
  }
}

export default AdvancedCollectionService.getInstance();
