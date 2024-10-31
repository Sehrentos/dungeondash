import 'dotenv/config';
import express from 'express';
// import https from 'https';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;

// SSL/HTTPS certificates
// const options = {
//     key: readFileSync('./key.pem'),
//     cert: readFileSync('./cert.pem'),
// };

// create a new express app
const app = express();
// const server = https.createServer(options, app).listen(PORT, () => {
//     console.log(`Web process ${process.pid} is listening https://${HOST}:${PORT}/`)
// });
// HTTP only in local development
const server = app.listen(PORT, () => {
	console.log(`Web process ${process.pid} is listening http://${HOST}:${PORT}/`)
});

// TODO
// create game websocket server (ws://127.0.0.1:3000/<path>)
// const world = new World(server);
// console.log('World created, awaiting connections... pre-loaded maps:', world.maps.length);

// parse incoming requests with JSON payloads
app.use(express.json());

// serve static files
app.use(express.static('dist'));

// @ts-ignore serve empty favicon.ico
app.get('/favicon.ico', (req, res) => {
	res.writeHead(200, {
		'Content-Type': 'image/x-icon',
		'Cache-control': `public, max-age=${60 * 60 * 12}`, // 12 hour cache
	});
	return res.end();
});

// TODO
// configure routes
// app.use('/api', api);
