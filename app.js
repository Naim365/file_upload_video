const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const app = express()
const port = process.env.PORT || 5000

//mysql start
//use express static folder
app.use(express.static("./videos"));
 
// body-parser middleware use
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))
 
// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "test"
})
 
db.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})
 
//end

// File upload folder
const UPLOADS_FOLDER = "./uploads/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
       const fileExt = path.extname(file.originalname);
       const fileName = file.originalname
                     .replace(fileExt, '')
                     .toLowerCase()
                     .split(' ')
                     .join('-') + "-" + Date.now();
         cb(null, fileName + fileExt);
    }
});

var upload = multer({
    storage: storage

   //dest: UPLOADS_FOLDER
});



 // multiple ar jonno upload.array  single ar jonno upload.single

    //upload.array("avater", 5) // upload.fields multiple

// app.post("/", upload.array("avater", 5), (req, res)=> {   
    
   

//     console.log(req.files);
//     res.send(req.files);
// })


app.get('/', (req, res) => { 
    res.send('Hello People'); 
});


//video upload

// const videoStorage = multer.diskStorage({
//     destination: 'videos', // Destination to store video 

//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now() 
//          + path.extname(file.originalname))
//     }
// });

const videoStorage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, './videos');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});


const videoUpload = multer({
    storage: videoStorage,
    limits: {
    fileSize: 10000000 // 10000000 Bytes = 10 MB
    },
    fileFilter(req, file, cb) {
      // upload only mp4 and mkv format
      if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) { 
         return cb(new Error('Please upload a video'))
      }
      cb(undefined, true)
   }
})

app.post('/', videoUpload.array('video', 5), (req, res) => {

    if(!req.files) {
        console.log("No file uploaded");
    }
    else {
        console.log(req.files.fileName)
        var videosrc = 'http://localhost:5000/' + req.files.fileName;
        var insertData = "INSERT INTO users_file(file_src) VALUES(?)";
        db.query(insertData, [videosrc], (err, result) => {
            if (err) throw err
            console.log("file uploaded")
        })

    }

    console.log(req.files);
    res.send(req.files)
 }, (error, req, res, next) => {
     res.status(400).send({ error: error.message })
 })


app.listen(port, () => {
    console.log('Server is up on port ' + port);
})