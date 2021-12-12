var express = require('express');

const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var app = express();

app.use(
	express.urlencoded({
		extended: true,
	})
);
app.use(express.static('views'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(cookieParser());
const morgan = require('morgan');

app.use(morgan('common'));
app.use(express.json());
app.use(cors());

app.get('/main', (req, res) => {
	const id = req.cookies.id;
	const list = JSON.parse(fs.readFileSync(`list-${id}.json`).toString());
	const diff = JSON.parse(fs.readFileSync(`difficult-${id}.json`).toString());
	return res.render('index', {
		list: jsonToArray(list),
		diff: jsonToArray(diff),
	});
});

app.get('/', (req, res) => {
	return res.render('main');
});

app.get('/register/:msg', (req, res) => {
	const msg = '- ID AlREADY EXISTED';
	return res.render('register', {
		msg,
	});
});
app.get('/register', (req, res) => {
	return res.render('register');
});
app.post('/login', (req, res) => {
	const { id, pw } = req.body;
	fs.readFile('memberList.json', (err, data) => {
		if (err) throw err;
		const memberList = JSON.parse(data.toString());
		console.log(memberList);
		console.log(req.body);
		if (memberList[id] && pw === memberList[id].pw) {
			res.cookie('id', id);
			console.log(res.cookie);
			res.redirect('/main');
		} else {
			return res.render('main', {
				msg: '로그인 정보를 확인해주세요',
			});
		}
	});
});
app.post('/join', (req, res) => {
	fs.readFile('memberList.json', (err, data) => {
		if (err) throw err;
		const memberList = JSON.parse(data.toString());
		const { id, pw, nickname } = req.body;
		if (memberList[id]) {
			res.redirect('/register/existing');
		} else {
			memberList[id] = {
				pw,
				nickname,
			};
			console.log(memberList);
			fs.open(`list-${id}.json`, 'w', function (err, fd) {
				if (err) console.error(err);
				fs.write(fd, '{}', err => {});
			});
			fs.open(`difficult-${id}.json`, 'w', function (err, fd) {
				if (err) console.error(err);
				fs.write(fd, '{}', err => {});
			});
			fs.writeFile('./memberList.json', JSON.stringify(memberList), err => {
				if (err) throw err;
				res.redirect('/');
			});
		}
	});
});
app.post('/enroll', (req, res) => {
	const id = req.cookies.id;
	const key = Object.keys(req.body)[0];
	const value = req.body[key];
	fs.readFile(`list-${id}.json`, (err, data) => {
		if (err) throw err;
		const list = JSON.parse(data.toString());
		if (list[key]) {
			console.log('existing');
			res.send(
				JSON.stringify({
					word: 'existing',
				})
			);
			res.end();
		} else {
			list[key] = [value, getListIndex(list) + 1];
			fs.writeFile(`list-${id}.json`, JSON.stringify(list), err => {
				if (err) throw err;
				console.log('단어 등록 성공');
				res.send(JSON.stringify(jsonToArray(list)));
				res.end();
			});
		}
	});
});
app.delete('/delete/:word', (req, res) => {
	const id = req.cookies.id;
	const word = req.params.word;
	fs.readFile(`list-${id}.json`, (err, data) => {
		if (err) throw err;
		const list = JSON.parse(data.toString());
		delete list[word];
		fs.writeFile(`list-${id}.json`, JSON.stringify(list), err => {
			if (err) throw err;
			console.log('단어 삭제 성공');
			res.send(JSON.stringify(jsonToArray(list)));
			res.end();
		});
	});
});
app.delete('/deleteDiff/:word', (req, res) => {
	const word = req.params.word;
	const id = req.cookies.id;
	fs.readFile(`difficult-${id}.json`, (err, data) => {
		if (err) throw err;
		const diff = JSON.parse(data.toString());
		delete diff[word];
		console.log(diff);
		fs.writeFile(`difficult-${id}.json`, JSON.stringify(diff), err => {
			if (err) throw err;
			console.log('어려운 단어 삭제 성공');
			res.send(JSON.stringify(jsonToArray(diff)));
			res.end();
		});
	});
});

app.post('/diff_word', (req, res) => {
	const id = req.cookies.id;
	const key = Object.keys(req.body)[0];
	const value = req.body[key];
	fs.readFile(`difficult-${id}.json`, (err, data) => {
		if (err) throw err;
		const diff = JSON.parse(data.toString());
		if (diff[key]) {
			console.log('existing');
			res.send(
				JSON.stringify({
					word: 'existing',
				})
			);
			res.end();
		} else {
			diff[key] = [value, getListIndex(diff) + 1];
			fs.writeFile(`difficult-${id}.json`, JSON.stringify(diff), err => {
				if (err) throw err;
				console.log('단어 등록 성공');
				res.send(JSON.stringify(jsonToArray(diff)));
				res.end();
			});
		}
	});
});

app.listen(3000, function () {
	console.log('start! express server on port 3000');
});

function getListIndex(obj) {
	console.log(obj);
	const last = Object.keys(obj).sort((a, b) => {
		if (obj[a][1] < obj[b][1]) {
			return 1;
		} else {
			return -1;
		}
	})[0];

	return obj[last] ? obj[last][1] : 0;
}

function jsonToArray(list) {
	const arr = [];
	for (let key in list) {
		arr.push([key, list[key][0], Number(list[key][1])]);
	}
	return arr;
}
