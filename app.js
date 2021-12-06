var express = require('express');

const fs = require('fs');
const cors = require('cors');

const list = JSON.parse(fs.readFileSync('list.json').toString());
const diff = JSON.parse(fs.readFileSync('difficult.json').toString());
var app = express();

app.use(express.static('views'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
const morgan = require('morgan');

app.use(morgan('common'));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	return res.render('index', { list: jsonToArray(list), diff: jsonToArray(diff) });
});
 
app.post('/enroll', (req, res) => {
	const key = Object.keys(req.body)[0];
	const value = req.body[key];
	if (list[key]) {
		console.log('existing');
		res.send(JSON.stringify({ word: 'existing' }));
		res.end();
	} else {
		list[key] = [value, getListIndex(list) + 1];
		fs.writeFile('./list.json', JSON.stringify(list), err => {
			if (err) throw err;
			console.log('단어 등록 성공');
			res.send(JSON.stringify(jsonToArray(list)));
			res.end();
		});
	}
});
app.delete('/delete/:word', (req, res) => {
	const word = req.params.word;
	delete list[word];
	fs.writeFile('./list.json', JSON.stringify(list), err => {
		if (err) throw err;
		console.log('단어 삭제 성공');
		res.send(JSON.stringify(jsonToArray(list)));
		res.end();
	});
});
app.delete('/deleteDiff/:word', (req, res) => {
	const word = req.params.word;
	console.log(word);
	delete diff[word];
	console.log(diff);
	fs.writeFile('./difficult.json', JSON.stringify(diff), err => {
		if (err) throw err;
		console.log('어려운 단어 삭제 성공');
		res.send(JSON.stringify(jsonToArray(diff)));
		res.end();
	});
});

app.post('/diff_word', (req, res) => {
	const key = Object.keys(req.body)[0];
	const value = req.body[key];
	if (diff[key]) {
		console.log('existing');
		res.send(JSON.stringify({ word: 'existing' }));
		res.end();
	} else {
		diff[key] = [value, getListIndex(diff) + 1];
		fs.writeFile('./difficult.json', JSON.stringify(diff), err => {
			if (err) throw err;
			console.log('단어 등록 성공');
			res.send(JSON.stringify(jsonToArray(diff)));
			res.end();
		});
	}
});

app.listen(3000, function () {
	console.log('start! express server on port 3000');
});
function getListIndex(obj) {
	const last = Object.keys(obj).sort((a, b) => {
		if (obj[a][1] < obj[b][1]) {
			return 1;
		} else {
			return -1;
		}
	})[0];

	return obj[last][1];
}
function jsonToArray(list) {
	const arr = [];
	for (let key in list) {
		arr.push([key, list[key][0], Number(list[key][1])]);
	}
	return arr;
}
