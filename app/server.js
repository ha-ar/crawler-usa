import express from 'express';
import start from './crawl_usa.js';
const app = express();
const port = 3000;
let result = [];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/showData', (req, res) => {
	// show data in tabular form
	res.send('Data will be shown here');
});


	
app.get('/', async (req, res) => {
	// get params from url to start crawling
	// http://localhost:3000/?name=a&limit=1000

	const firstChar = req.query.name;
	const limit = req.query.limit;

	res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
	
	// call crawl_usa function
	try {
		const result = await crawl_usa(firstChar, limit);
		res.write('Crawl completed', result);
	} catch (error) {
		console.error('Error occurred during crawl:', error);
		res.status(500).send('Error occurred during crawl');
	}
		
});

function crawl_usa(firstChar, limit) {
	// Your crawl_usa logic here
	return new Promise((resolve, reject) => {
		// print the result of crawl_usa
		resolve(start(firstChar, limit));

	});
}

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
