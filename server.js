const express = require('express');
const app = express();
// express의 bodyParser 가져오는 코드
app.use(express.urlencoded({ extended: true }));
// mongoDB 연결
const MongoClient = require('mongodb').MongoClient;
// EJS 가져오는 코드
app.set('view engine', 'ejs');

// database를 저장할 변수 하나 선언
var db;

// DB 연결 (cb: DB가 연결되면 할 일)
MongoClient.connect(
  'mongodb+srv://cheryl_admin:@rosy77@cheryl-admin.ezcwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  function (err, client) {
    // 에러 처리
    if (err) return console.log(err);

    // db 가져오기
    db = client.db('todoApp');

    app.listen(8080, function () {
      console.log('listening on 8080');
    });
  }
);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/write', function (req, res) {
  res.sendFile(__dirname + '/write.html');
});

app.post('/add', function (req, res) {
  // res.send 부분은 항상 존재해야
  // 전송이 성공하든 실패하든 뭔가 서버에 보내줘야 한다 (안 그러면 브라우저가 멈춤)
  // 간단한 응답코드를 보내거나 아니면 리다이렉트(페이지 강제이동)해줄 수도 있음
  res.send('전송완료');

  // db의 collection을 가져와서 데이터 하나 추가
  db.collection('post').insertOne(
    { 제목: req.body.title, 날짜: req.body.date },
    function (err, result) {
      console.log('저장완료');
    }
  );
});

// /list로 GET요청 접속하면
// 실제 DB에 저장된 데이터들이 들어간 HTML 렌더링
app.get('/list', function (req, res) {
  res.render('list.ejs');
});
