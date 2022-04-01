var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressFileupload = require('express-fileupload');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongojs = require('mongojs');

var app = express();
app.use(expressFileupload());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/login', indexRouter);
app.use('/adminlogin', indexRouter);
app.use('/admin_process_login', indexRouter);
app.use('/process_login', indexRouter);
app.use('/register', indexRouter);

app.use('/userhome', indexRouter);
app.use('/userbooks', indexRouter);
app.use('/userprofile', indexRouter);
app.use('/useriq', indexRouter);
app.use('/userregbooks', indexRouter);
app.use('/usercompilers', indexRouter);
app.use('/usertimetable', indexRouter);
app.use('/usersoftware', indexRouter);
app.use('/userforums', indexRouter);
app.use('/userquiz', indexRouter);
app.use('/usersuggestions', indexRouter);

app.use('/adminhome', indexRouter);
app.use('/adminbooks', indexRouter);
app.use('/adminprofile', indexRouter);
app.use('/adminiq', indexRouter);
app.use('/adminregbooks', indexRouter);
app.use('/adminsuggestions', indexRouter);
app.use('/adminquiz', indexRouter);
app.use('/adminregister', indexRouter);

app.use('/R16-civil-menu', indexRouter);
app.use('/R16-cse-menu', indexRouter);
app.use('/R16-ece-menu', indexRouter);
app.use('/R16-eee-menu', indexRouter);
app.use('/R16-it-menu', indexRouter);
app.use('/R16-mech-menu', indexRouter);

app.use('/adminlab', indexRouter);
app.use('/adminqa', indexRouter);
app.use('/adminmaterials', indexRouter);
app.use('/adminsyllabus', indexRouter);

app.use('/R16-cse-syllabus', indexRouter);
app.use('/R16-cse-notes', indexRouter);
app.use('/R16-cse-previous_papers', indexRouter);

app.use('/R16-ece-syllabus', indexRouter);
app.use('/R16-ece-notes', indexRouter);
app.use('/R16-ece-previous_papers', indexRouter);

app.use('/R16-eee-syllabus', indexRouter);
app.use('/R16-eee-notes', indexRouter);
app.use('/R16-eee-previous_papers', indexRouter);

app.use('/R16-it-syllabus', indexRouter);
app.use('/R16-it-notes', indexRouter);
app.use('/R16-it-previous_papers', indexRouter);

app.use('/R16-mech-syllabus', indexRouter);
app.use('/R16-mech-notes', indexRouter);
app.use('/R16-mech-previous_papers', indexRouter);

app.use('/R16-civil-syllabus', indexRouter);
app.use('/R16-civil-notes', indexRouter);
app.use('/R16-civil-previous_papers', indexRouter);

app.use('/R16-cse-notes-1-1', indexRouter);
app.use('/R16-cse-notes-1-2', indexRouter);
app.use('/R16-cse-notes-2-1', indexRouter);
app.use('/R16-cse-notes-2-2', indexRouter);
app.use('/R16-cse-notes-3-1', indexRouter);
app.use('/R16-cse-notes-3-2', indexRouter);
app.use('/R16-cse-notes-4-1', indexRouter);
app.use('/R16-cse-notes-4-2', indexRouter);

app.use('/R16-it-notes-1-1', indexRouter);
app.use('/R16-it-notes-1-2', indexRouter);
app.use('/R16-it-notes-2-1', indexRouter);
app.use('/R16-it-notes-2-2', indexRouter);
app.use('/R16-it-notes-3-1', indexRouter);
app.use('/R16-it-notes-3-2', indexRouter);
app.use('/R16-it-notes-4-1', indexRouter);
app.use('/R16-it-notes-4-2', indexRouter);

app.use('/R16-ece-notes-1-1', indexRouter);
app.use('/R16-ece-notes-1-2', indexRouter);
app.use('/R16-ece-notes-2-1', indexRouter);
app.use('/R16-ece-notes-2-2', indexRouter);
app.use('/R16-ece-notes-3-1', indexRouter);
app.use('/R16-ece-notes-3-2', indexRouter);
app.use('/R16-ece-notes-4-1', indexRouter);
app.use('/R16-ece-notes-4-2', indexRouter);

app.use('/R16-eee-notes-1-1', indexRouter);
app.use('/R16-eee-notes-1-2', indexRouter);
app.use('/R16-eee-notes-2-1', indexRouter);
app.use('/R16-eee-notes-2-2', indexRouter);
app.use('/R16-eee-notes-3-1', indexRouter);
app.use('/R16-eee-notes-3-2', indexRouter);
app.use('/R16-eee-notes-4-1', indexRouter);
app.use('/R16-eee-notes-4-2', indexRouter);

app.use('/R16-civil-notes-1-1', indexRouter);
app.use('/R16-civil-notes-1-2', indexRouter);
app.use('/R16-civil-notes-2-1', indexRouter);
app.use('/R16-civil-notes-2-2', indexRouter);
app.use('/R16-civil-notes-3-1', indexRouter);
app.use('/R16-civil-notes-3-2', indexRouter);
app.use('/R16-civil-notes-4-1', indexRouter);
app.use('/R16-civil-notes-4-2', indexRouter);

app.use('/R16-mech-notes-1-1', indexRouter);
app.use('/R16-mech-notes-1-2', indexRouter);
app.use('/R16-mech-notes-2-1', indexRouter);
app.use('/R16-mech-notes-2-2', indexRouter);
app.use('/R16-mech-notes-3-1', indexRouter);
app.use('/R16-mech-notes-3-2', indexRouter);
app.use('/R16-mech-notes-4-1', indexRouter);
app.use('/R16-mech-notes-4-2', indexRouter);

app.use('/admincsequiz', indexRouter);
app.use('/adminitquiz', indexRouter);
app.use('/adminecequiz', indexRouter);
app.use('/admineeequiz', indexRouter);
app.use('/adminmechquiz', indexRouter);
app.use('/admincivilquiz', indexRouter);

app.use('/usercsequiz', indexRouter);
app.use('/useritquiz', indexRouter);
app.use('/userecequiz', indexRouter);
app.use('/usereeequiz', indexRouter);
app.use('/usermechquiz', indexRouter);
app.use('/usercivilquiz', indexRouter);

app.use('csequiz', indexRouter);


app.use('/welcome', indexRouter);
app.use('/story', indexRouter);
app.use('/logout', indexRouter);



app.use('/getdata', indexRouter);
module.exports = app;
