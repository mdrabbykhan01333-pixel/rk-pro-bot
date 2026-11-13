# RK PRO BOT — PRO MAX

## কী আছে
- Real Forex (`forex`) এবং Quotex OTC (`quotex`) data source নির্বাচন
- Provider-এর live symbol catalogue থেকে asset নির্বাচন
- 30-second auto scan
- Candle chart, RSI, EMA, MACD এবং indicator-confluence score
- CALL / PUT / WAIT signal history
- API key browser-এ প্রকাশ না করে Node.js server-এ রাখা

## গুরুত্বপূর্ণ সীমাবদ্ধতা
- Quotex-এর নিজস্ব official public developer API নেই। এই project-এ OTCharts-এর third-party, read-only market-data API adapter ব্যবহার করা হয়েছে; এটি Quotex-এর সঙ্গে affiliated নয়।
- Provider-এর key ও plan অনুযায়ী asset এবং live stream সীমিত হতে পারে।
- Real Forex feed-এ 1-minute candle ব্যবহৃত হয়; Quotex feed-এ 30-second candle ব্যবহৃত হয়। উভয় ক্ষেত্রেই scanner 30 সেকেন্ডে একবার বিশ্লেষণ করে।
- Confidence score কেবল indicator agreement; এটি 70–80% win-rate বা লাভের নিশ্চয়তা নয়।
- App শুধু market data পড়ে; Quotex-এ login করে না, order দেয় না, auto-trade করে না।

## চালানোর নিয়ম
1. Node.js 18 বা তার পরের সংস্করণ ইনস্টল করুন।
2. OTCharts-এ account খুলে API key তৈরি করুন: https://otcharts.com/quotex-api
3. Project folder-এ `.env.example` কপি করে `.env` নাম দিন এবং key বসান। `npm install` চালালে `.env` স্বয়ংক্রিয়ভাবে পড়ার জন্য প্রয়োজনীয় package ইনস্টল হবে।
4. `.env` ফাইলের key কখনো GitHub-এ public করবেন না।
5. Terminal-এ চালান:

   ```bash
   npm start
   ```

6. Browser-এ `http://localhost:3000` খুলুন।

এই app GitHub Pages-এ একা চলবে না, কারণ API key সুরক্ষিত রাখতে Node.js backend দরকার। Backend-সহ Node hosting (যেমন Render বা VPS) লাগবে। `.env`-এ রাখা key কখনো public GitHub repository-তে commit করবেন না; hosting-এর Environment Variables/Secrets-এ সেট করুন।

## Deploy করার আগে
- Hosting dashboard-এ secret environment variable `OTCHARTS_API_KEY` সেট করুন।
- `npm start` start command দিন।
- Provider-এর terms, data licensing, plan, allowed instruments এবং stream limits যাচাই করুন।
- প্রথমে Demo/paper test করুন; historical ও forward test ছাড়া confidence score-কে accuracy ধরে নেবেন না।


## দুইটি book একসঙ্গে
Free, Lite ও Build API plan-এ একবারে একটি book বেছে নেওয়া যায়। Quotex এবং Real Forex দুটোই একই সময়ে দরকার হলে বর্তমান pricing অনুযায়ী Run plan তিনটি book খুলতে পারে; কেনার আগে provider-এর live pricing যাচাই করুন।
