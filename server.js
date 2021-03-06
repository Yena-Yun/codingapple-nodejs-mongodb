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

// Home 화면
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// 글 작성하는 화면
app.get('/write', function (req, res) {
  res.sendFile(__dirname + '/write.html');
});

// db에 작성된 글 데이터 보내기 (브라우저 화면에는 '전송완료' 띄움)
app.post('/add', function (req, res) {
  // counter라는 collection에 들어있는 데이터 중, name이 '게시물갯수'인 데이터를 찾아
  db.collection('counter').findOne(
    { name: '게시물갯수' },
    function (err, result) {
      // 총 게시물 갯수를 구한다
      let totalPostCount = result.totalPost;

      // db의 post라는 collection을 가져와서 데이터 하나 추가
      // 데이터 추가 시 _id를 기존의 총 게시물 갯수 + 1로 설정
      db.collection('post').insertOne(
        { _id: totalPostCount + 1, 제목: req.body.title, 날짜: req.body.date },
        function (err, result) {
          console.log('저장완료');

          // counter라는 collection의 totalPost 항목도 1 증가시켜야
          // updateOne({ 어떤 데이터를 수정할 지 }, { $set: {수정할 값} }, function(){}: 필수 x, error 체크 시 사용)
          // updateOne의 연산자(operator): $set(변경), $inc(증가), $min(기존값보다 적을 때만 변경), $rename(key값 이름 변경)
          db.collection('counter').updateOne(
            { name: '게시물갯수' },
            // { $inc: { totalPost: 100 } => 현재의 totalPost에 100을 더함 (음수(-100)도 가능: -100으로 increment 실행)
            // { $set: { totalPost: 1 } } => 현재의 totalPost를 1로 설정
            { $inc: { totalPost: 1 } },
            function (err, result) {
              if (err) {
                return console.log(err);
              }
            }
          );
          // POST 전송 후 res.send 부분은 항상 존재해야
          // 전송이 성공하든 실패하든 뭔가 서버에 보내줘야 한다 (안 그러면 브라우저가 멈춤)
          // 간단한 응답코드를 보내거나 아니면 리다이렉트(페이지 강제이동)해줄 수도 있음
          res.send('전송완료');
        }
      );
    }
  );
});

// db에 저장된 글 데이터 전체 조회하기
// /list로 GET요청 접속하면
// 실제 DB에 저장된 데이터들이 들어간 HTML 렌더링
app.get('/list', function (req, res) {
  // DB에서 자료를 찾아서
  db.collection('post')
    .find()
    .toArray(function (err, result) {
      console.log(result);
      // 찾은 자료를 EJS 파일에 넣기
      res.render('list.ejs', { posts: result });
    });
});
