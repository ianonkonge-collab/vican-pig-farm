// Inspirational farm quotes
const farmQuotes = [
  {
    quote: "The best fertilizer is the farmer's shadow.",
    author: "Farming Wisdom"
  },
  {
    quote: "Agriculture is the most healthful, most useful, and most noble employment of man.",
    author: "George Washington"
  },
  {
    quote: "To forget how to dig the earth and to tend the soil is to forget ourselves.",
    author: "Mahatma Gandhi"
  },
  {
    quote: "Farming looks mighty easy when your plow is a pencil and you're a thousand miles from the corn field.",
    author: "Dwight D. Eisenhower"
  },
  {
    quote: "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.",
    author: "Masanobu Fukuoka"
  },
  {
    quote: "Farmers are the backbone of our economy and the stewards of our land.",
    author: "Agricultural Proverb"
  },
  {
    quote: "The farmer has to be an optimist or he wouldn't still be a farmer.",
    author: "Will Rogers"
  },
  {
    quote: "A farmer is a magician who produces money from the mud.",
    author: "Amit Kalantri"
  },
  {
    quote: "The discovery of agriculture was the first big step toward a civilized life.",
    author: "Arthur Keith"
  },
  {
    quote: "Successful farming is about working with nature, not against it.",
    author: "Sustainable Farming Wisdom"
  },
  {
    quote: "The care of the Earth is our most ancient and most worthy, and after all our most pleasing responsibility.",
    author: "Wendell Berry"
  },
  {
    quote: "Agriculture is our wisest pursuit, because it will in the end contribute most to real wealth, good morals, and happiness.",
    author: "Thomas Jefferson"
  },
  {
    quote: "Every day, farmers wake up and grow food for the world. That's the ultimate act of service.",
    author: "Farming Philosophy"
  },
  {
    quote: "The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways.",
    author: "John F. Kennedy"
  },
  {
    quote: "The greatest fine art of the future will be the making of a comfortable living from a small piece of land.",
    author: "Abraham Lincoln"
  }
];

// Get quote based on day (consistent per day) or random
function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const quoteIndex = dayOfYear % farmQuotes.length;
  return farmQuotes[quoteIndex];
}

// Get random quote
function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * farmQuotes.length);
  return farmQuotes[randomIndex];
}

// Display quote on page load
function displayQuote(random = false) {
  const quoteElement = document.getElementById('dailyQuote');
  const authorElement = document.getElementById('quoteAuthor');
  
  if (!quoteElement || !authorElement) return;
  
  const selectedQuote = random ? getRandomQuote() : getDailyQuote();
  
  // Fade out
  quoteElement.style.opacity = '0';
  authorElement.style.opacity = '0';
  
  setTimeout(() => {
    quoteElement.textContent = `"${selectedQuote.quote}"`;
    authorElement.textContent = `— ${selectedQuote.author}`;
    
    // Fade in
    quoteElement.style.transition = 'opacity 0.5s ease-in';
    authorElement.style.transition = 'opacity 0.5s ease-in';
    quoteElement.style.opacity = '1';
    authorElement.style.opacity = '1';
  }, 250);
}

// Refresh quote (random)
function refreshQuote() {
  displayQuote(true);
}

// Make refreshQuote globally accessible
window.refreshQuote = refreshQuote;

// Initialize quote on page load
document.addEventListener('DOMContentLoaded', () => {
  displayQuote(false);
});

