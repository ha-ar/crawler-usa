import * as cheerio from 'cheerio';
import fs from 'fs';
let fileName: string;

start();

async function start() {
	for (let i = 0; i < 100; i++) {
		fileName = 'usa' + i + '.csv';
		await getResults('a/' + i);
	}
}

async function getResults(search: string) {
	const html = await fetch('https://www.officialusa.com/p/' + search, {
		headers: {
			accept:
				'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
			'accept-language': 'en-US,en;q=0.9',
			priority: 'u=0, i',
			cookie: 'PHPSESSID=dg813dog802sbd3p7251i271qc',
		},
		referrerPolicy: 'strict-origin-when-cross-origin',
		body: null,
		method: 'GET',
	});
	const $ = cheerio.load(await html.text());
	const links = $(
		'div.container.flex-grow-1.mt-5.mb-5 > div.row.border-bottom.pb-3 > div'
	).map((index, element) => {
		console.log($(element).find('a').attr('href'));
		return $(element).find('a').attr('href');
	});

	for (let i = 0; i < links.length; i++) {
		// Navigate to the provider detail page
		const page = await fetch('https://www.officialusa.com' + links[i], {
			headers: {
				accept:
					'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
				cookie: 'PHPSESSID=dg813dog802sbd3p7251i271qc',
			},
			referrerPolicy: 'strict-origin-when-cross-origin',
			body: null,
			method: 'GET',
		});

		const $ = cheerio.load(await page.text());
		const parents = $('div.person');
		parents.each(function (index, parent) {
			const name = $(parent)
				.find('div.detail-block__main-item-name > h2 > span')
				.text();
			const phone = $(parent)
				.find(
					'div.detail-block__main-item-content > div > div:nth-child(2) > div > ul > li:nth-child(1) > span'
				)
				.text();
			// savse the extracted information to a file
			fs.appendFile(fileName, `${name}, ${phone} \n`, (err: any) => {
				if (err) throw err;
			});
		});
	}
}
