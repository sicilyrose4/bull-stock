// Static content for Bull Stock. Prices are fixed (from the Figma prototype);
// company stats are approximate real-world figures.

const STOCKS = {
  AAPL: { short: 'Apple', name: 'Apple Inc.', price: 122.35, pct: 1.17, abs: 1.30,
    cap: '3.85T', cash: '55.37B', dividend: 1.04, yield: 0.85,
    logo: 'assets/logo-aapl.png', logoScale: 56 / 64, logoY: -3 / 64 },
  GOOGL: { short: 'Alphabet', name: 'Alphabet Inc.', price: 268.12, pct: -0.43, abs: -1.15,
    cap: '3.24T', cash: '95.66B', dividend: 0.84, yield: 0.31,
    logo: 'assets/logo-googl.png', logoScale: 43 / 64 },
  AMZN: { short: 'Amazon', name: 'Amazon.com, Inc.', price: 230.14, pct: 1.40, abs: 3.17,
    cap: '2.45T', cash: '93.18B', dividend: 0, yield: 0,
    logo: 'assets/logo-amzn.png', logoScale: 41 / 64 },
  MSFT: { short: 'Microsoft', name: 'Microsoft Corp.', price: 543.68, pct: 2.29,
    cap: '4.04T', cash: '94.56B', dividend: 3.64, yield: 0.67,
    logo: 'assets/logo-msft.png', logoScale: 69 / 64, logoX: 2.5 / 64, logoY: 2.5 / 64 },
  JNJ: { short: 'Johnson & Johnson', name: 'Johnson & Johnson', price: 186.94, pct: -1.77,
    cap: '450.2B', cash: '18.57B', dividend: 5.20, yield: 2.78,
    logo: 'assets/logo-jnj.png', logoScale: 34.468 / 64 },
  NKE: { short: 'Nike', name: 'NIKE, Inc.', price: 67.46, pct: -1.03,
    cap: '99.6B', cash: '8.58B', dividend: 1.60, yield: 2.37,
    logo: 'assets/logo-nike.svg', logoScale: 56 / 64, logoX: 2 / 64 },
  META: { short: 'Meta', name: 'Meta Platforms', price: 754.82, pct: 4.01,
    cap: '1.90T', cash: '47.07B', dividend: 2.10, yield: 0.28,
    logo: 'assets/logo-meta.png', logoScale: 43 / 64 },
  TSLA: { short: 'Tesla', name: 'Tesla, Inc.', price: 462.41, pct: 2.21,
    cap: '1.49T', cash: '36.78B', dividend: 0, yield: 0,
    logo: 'assets/logo-tsla.png', logoScale: 52 / 64, logoY: 2 / 64 },
};

// More companies for search. There's no logo art for these yet, so they show a
// ticker lettermark — drop a logo file in assets/ and add `logo:` to use it.
const MORE = [
  ['NVDA', 'NVIDIA', 'NVIDIA Corp.', 182.16, 1.88, '4.43T', '56.79B', 0.04, 0.02],
  ['NFLX', 'Netflix', 'Netflix, Inc.', 1189.53, -0.92, '505.6B', '9.29B', 0, 0],
  ['DIS', 'Disney', 'The Walt Disney Co.', 112.45, 0.64, '202.3B', '5.38B', 1.00, 0.89],
  ['SBUX', 'Starbucks', 'Starbucks Corp.', 84.27, -1.21, '95.8B', '3.82B', 2.48, 2.94],
  ['KO', 'Coca-Cola', 'The Coca-Cola Co.', 68.92, 0.35, '296.5B', '13.23B', 2.04, 2.96],
  ['PEP', 'PepsiCo', 'PepsiCo, Inc.', 151.30, -0.48, '207.4B', '7.35B', 5.69, 3.76],
  ['MCD', 'McDonald’s', 'McDonald’s Corp.', 301.75, 0.27, '215.6B', '1.88B', 7.44, 2.47],
  ['COST', 'Costco', 'Costco Wholesale', 918.40, 0.82, '407.2B', '14.16B', 5.20, 0.57],
  ['WMT', 'Walmart', 'Walmart Inc.', 103.18, 1.06, '822.6B', '9.04B', 0.94, 0.91],
  ['TGT', 'Target', 'Target Corp.', 92.64, -2.14, '42.1B', '3.81B', 4.56, 4.92],
  ['SPOT', 'Spotify', 'Spotify Technology', 694.20, 3.12, '142.3B', '9.41B', 0, 0],
  ['UBER', 'Uber', 'Uber Technologies', 96.85, 1.47, '201.6B', '7.04B', 0, 0],
  ['ABNB', 'Airbnb', 'Airbnb, Inc.', 124.33, -0.76, '76.4B', '11.38B', 0, 0],
  ['SHOP', 'Shopify', 'Shopify Inc.', 163.90, 2.58, '213.5B', '5.79B', 0, 0],
  ['PYPL', 'PayPal', 'PayPal Holdings', 69.42, -1.35, '66.4B', '15.79B', 0.56, 0.81],
  ['AMD', 'AMD', 'Advanced Micro Devices', 214.60, 4.27, '348.2B', '5.87B', 0, 0],
  ['INTC', 'Intel', 'Intel Corp.', 37.15, -2.03, '162.4B', '21.20B', 0, 0],
  ['ORCL', 'Oracle', 'Oracle Corp.', 291.38, 1.12, '818.9B', '11.03B', 2.00, 0.69],
  ['CRM', 'Salesforce', 'Salesforce, Inc.', 245.70, -0.58, '234.7B', '15.37B', 1.66, 0.68],
  ['ADBE', 'Adobe', 'Adobe Inc.', 338.12, 0.94, '143.6B', '5.71B', 0, 0],
];
for (const [t, short, name, price, pct, cap, cash, dividend, yld] of MORE) {
  STOCKS[t] = { short, name, price, pct, cap, cash, dividend, yield: yld };
}

const POPULAR = ['AAPL', 'MSFT', 'JNJ', 'NVDA', 'AMD', 'NFLX'];
const FOR_YOU = ['NKE', 'META', 'TSLA', 'SBUX', 'SPOT', 'DIS'];
const SEARCH_ROWS = [
  ['Popular Stocks', POPULAR],
  ['For You', FOR_YOU],
  ['Everyday Brands', ['KO', 'PEP', 'MCD', 'COST', 'WMT', 'TGT']],
  ['Trending in Tech', ['UBER', 'ABNB', 'SHOP', 'PYPL', 'ORCL', 'CRM', 'ADBE', 'INTC']],
];
const START_WATCHLIST = ['AAPL', 'GOOGL', 'AMZN'];
const START_BALANCE = 500;

// Definition pop-ups. The first four are from the Figma file.
const DEFINITIONS = {
  cap: { title: 'What is Market Capitalization?', aka: 'Also known as Market Cap',
    body: 'The value of a company that is traded on the stock market, calculated by multiplying the total number of shares by the present share price.' },
  cash: { title: 'What is Total Cash',
    body: 'Cash recognized at the time of trade + futures P&L. This value reflects real-time currency positions.' },
  dividend: { title: 'What is a Dividend',
    body: 'A dividend is a distribution of a portion of a company’s profits to its shareholders. When a corporation earns a profit, its board of directors may decide to pay out some of those earnings as dividends instead of reinvesting all the profits back into the business.' },
  yield: { title: 'What is Dividend Yield',
    body: 'A dividend yield is a financial ratio that shows how much a company pays out in dividends each year relative to its stock price. Expressed as a percentage, it indicates the return on an investment from dividends alone, not including changes in the stock’s price.' },
  shares: { title: 'What is a Share?',
    body: 'A share is one unit of ownership in a company. Bull Stock lets you buy fractional shares, so you can own part of a share — like 1.52 shares — without paying for a whole one.' },
  price: { title: 'What is Market Price?', aka: 'Also known as MKT Price',
    body: 'The current price one share is trading for. Your total cost is the number of shares you buy multiplied by the market price.' },
  mock: { title: 'What is Mock Mode?',
    body: 'Mock Mode lets you practice investing with fake currency (₵). Nothing you buy or sell uses real money, so it’s a safe place to learn before you switch to Real Mode.' },
};

const NEWS = [
  { id: 'dip', img: 'assets/news-1.jpg', src: 'assets/news-src-1.png', read: '4 min read',
    title: 'Is the market really crashing? What a dip means for new investors',
    body: [
      'Headlines love the word “crash,” but most market drops are much smaller and much more common than they sound. Since 1950, the S&P 500 has fallen 10% or more from a recent high roughly once every two years — and it has recovered every time.',
      'For a new investor, a dip mostly changes the price you pay. If you’re investing a little at a time, falling prices mean the same amount of money buys more shares.',
      'What matters more than any single week is your timeline. Money you’ll need in the next year or two probably shouldn’t be in stocks at all. Money you won’t touch for ten years can ride out the bumps.',
      'Before you react to a red day, zoom out. Switch the chart from 1W to 1YR and see how much of the story you were missing.',
    ] },
  { id: 'steady', img: 'assets/news-2.png', src: 'assets/news-src-2.png', read: '3 min read',
    title: 'Why steady monthly investing beats trying to time the market',
    body: [
      'Trying to buy at the very bottom and sell at the very top sounds smart. In practice, even professionals rarely pull it off.',
      'A simpler approach is called dollar-cost averaging: you invest the same amount on a regular schedule, no matter what the price is. Some months you buy high, some months you buy low, and over time it evens out.',
      'The biggest benefit is behavioral. When the plan is automatic, you’re less likely to panic-sell on a bad day or chase a stock that’s already soared.',
      'Try it in Mock Mode: buy a small amount of the same stock a few times and watch how your average cost changes.',
    ] },
];

const POSTS = [
  { name: 'Linda Smith', handle: '@lindasmith24', avatar: 'assets/avatar-linda.jpg', likes: 102000, comments: 5200,
    text: 'Started putting $25 a week into an index fund last year and just checked my balance. Slow and steady really does add up. If you’re new, don’t stress about picking the “perfect” stock — consistency wins.' },
  { name: 'Frank Taylor', handle: '@stockmarketfrank', avatar: 'assets/avatar-frank.jpg', likes: 87400, comments: 3100,
    text: 'Reminder: a red day isn’t a reason to panic sell. Prices move up and down all the time. Zoom out to the 1YR chart before you make any big decisions with your portfolio.' },
  { name: 'Linda Smith', handle: '@lindasmith24', avatar: 'assets/avatar-linda.jpg', likes: 45900, comments: 1800,
    text: 'Practice tip: make a few trades in Mock Mode before switching to Real Mode. Mistakes are free there, and you’ll learn how buying fractional shares works.' },
];

const QUIZ = [
  { q: 'What is a dividend?',
    options: ['A portion of a company’s profits paid to shareholders', 'A fee you pay to buy a stock', 'A loan from a bank to a company', 'The price of one share'],
    answer: 0, why: 'Companies can share some of their profits with the people who own their stock.' },
  { q: 'How is market capitalization calculated?',
    options: ['Profits minus expenses', 'Total shares × the present share price', 'Cash plus debt', 'Dividends × number of years'],
    answer: 1, why: 'Market cap is the value of every share added together.' },
  { q: 'A stock costs $100 and pays $3 in dividends each year. What is its dividend yield?',
    options: ['30%', '0.3%', '3%', '103%'],
    answer: 2, why: '$3 ÷ $100 = 0.03, or a 3% dividend yield.' },
  { q: 'Which mode lets you practice with fake currency?',
    options: ['Real Mode', 'Mock Mode', 'Both modes', 'Neither mode'],
    answer: 1, why: 'Mock Mode uses ₵ so you can learn without risking real money.' },
];

// Tutorial courses. Each has two (fake) video lessons with a short summary, and a quiz.
const COURSES = {
  basics: {
    title: 'Investing Basics', img: 'assets/tut-lesson.png', poster: 'assets/video-poster.jpg',
    lessons: [
      { id: 'what', title: 'What is investing?', heading: 'What is Investing?', mins: 2, length: 118,
        summary: 'Investing means buying something, like a share of a company, that you expect to grow in value over time.' },
      { id: 'start', title: 'How to Start', heading: 'How to Start', mins: 3, length: 180,
        summary: 'Start small, practice in Mock Mode, and invest money you won’t need for a few years.' },
    ],
    quiz: QUIZ,
  },
  portfolio: {
    title: 'Building a Portfolio', img: 'assets/tut-card-2.png', poster: 'assets/tut-card-2.png',
    lessons: [
      { id: 'what', title: 'What is a portfolio?', heading: 'What is a Portfolio?', mins: 2, length: 124,
        summary: 'Your portfolio is everything you invest in. Your Portfolio tab shows its total value and each stock you own.' },
      { id: 'mix', title: 'Diversifying your picks', heading: 'Diversifying Your Picks', mins: 3, length: 171,
        summary: 'Owning a mix of companies in different industries means one bad day for a single stock hurts less.' },
    ],
    quiz: [
      { q: 'What is a portfolio?',
        options: ['A single stock you own', 'All the investments you own', 'A list of stocks you’re watching', 'Your bank account'],
        answer: 1, why: 'A portfolio is the whole collection of investments you hold.' },
      { q: 'Why do investors diversify?',
        options: ['To guarantee a profit', 'To pay fewer fees', 'To lower risk by not relying on one company', 'To buy stocks faster'],
        answer: 2, why: 'Spreading money out means one company’s drop has less effect on the total.' },
      { q: 'Which portfolio is the most diversified?',
        options: ['All your money in one stock', 'Shares in three phone makers', 'Only cash', 'Shares in tech, food, retail, and health companies'],
        answer: 3, why: 'Different industries tend to move differently, which balances things out.' },
    ],
  },
  trends: {
    title: 'Understanding Trends', img: 'assets/video-poster.jpg', poster: 'assets/video-poster.jpg',
    lessons: [
      { id: 'chart', title: 'Reading a price chart', heading: 'Reading a Price Chart', mins: 2, length: 132,
        summary: 'A chart shows price over time. Left is the past, right is today, and the 1W–1YR buttons change how far back you look.' },
      { id: 'swing', title: 'Ups, downs, and volatility', heading: 'Ups, Downs, and Volatility', mins: 3, length: 166,
        summary: 'Prices swing every day. A stock that swings a lot is volatile, so zoom out before reacting to one red day.' },
    ],
    quiz: [
      { q: 'On a price chart, a line rising from left to right means…',
        options: ['The price went up over that time', 'It will keep going up', 'The company is profitable', 'More people own it'],
        answer: 0, why: 'Charts show what already happened, not what will happen next.' },
      { q: 'What does the 1YR button show?',
        options: ['A prediction for next year', 'How the price moved over the last year', 'The yearly dividend', 'The price exactly one year ago'],
        answer: 1, why: 'It widens the chart to the past 12 months.' },
      { q: 'A stock whose price jumps up and down a lot is called…',
        options: ['Diversified', 'Stable', 'Volatile', 'Dividend-paying'],
        answer: 2, why: 'Volatility describes how much and how quickly a price moves.' },
    ],
  },
};

// "Important Terms" cards open short explainers.
const TERMS = [
  { id: 'dividends', img: 'assets/term-1.png', src: 'assets/term-src.png', read: '2 min read',
    title: 'Dividends: getting paid to own a stock',
    body: [
      'Some companies share part of their profits with the people who own their stock. That payment is called a dividend, and it’s usually paid every three months.',
      'Dividends are paid per share. If a company pays $1.04 a year per share and you own 10 shares, you’d get about $10.40 over the year.',
      'The dividend yield tells you how big that payment is compared with the stock’s price. A $100 stock paying $3 a year has a 3% yield.',
      'Not every company pays one. Fast-growing companies like Amazon and Tesla often reinvest profits instead. Check the Dividend card on any stock’s page to compare.',
    ] },
  { id: 'cap', img: 'assets/term-2.png', src: 'assets/tut-src.png', read: '1 min read',
    title: 'Market cap, explained in 60 seconds',
    body: [
      'Market capitalization, or market cap, is what the whole company is worth on the stock market.',
      'It’s simple math: the number of shares that exist multiplied by the price of one share. A company with 1 billion shares at $50 each has a $50 billion market cap.',
      'Market cap helps you compare companies of different sizes. A $5 share price doesn’t mean a company is small — it might have billions of shares.',
      'Investors often group companies as large-cap (over $10B), mid-cap, and small-cap. Large-caps tend to be steadier; small-caps can grow faster but swing more.',
    ] },
];
