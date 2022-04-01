var express = require('express');
var router = express.Router();
var path = require('path');
var db = require('../util/database');
const multer = require("multer")
const crypto = require('crypto');
var csv = require('csvtojson');
var userp = {};
var adminp = {};
var bfile;
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home');
});

// router.get('/routes/uploads/IT/*', function (req, res, next) {
//   var url = req.url;

//   url = url.split("/");

//   var pd = url.slice(-1);
//   var docLocation = pd[0];
//   window.open(docLocation, "resizeable,scrollbar");

//   res.send("SUCCESS.......");
// })

router.get('/login', function (req, res, next) {
  var status = req.query.status;
  if (status === 'fail') {
    status = "Invalid login.Please try again"
  }
  else if (status === 'ErrorinDB') {
    status = "Error in DB. Please try again"
  }
  res.render('login');
});
router.get('/adminlogin', function (req, res, next) {
  var status = req.query.status;
  if (status === 'fail') {
    status = "Invalid login.Please try again"
  }
  else if (status === 'ErrorinDB') {
    status = "Error in DB. Please try again"
  }
  res.render('adminlogin');
});
router.post('/process_login', function (req, res, next) {
  var user = req.body.username;
  var pass = req.body.password;
  db.dbobject.login.find({ username: user, password: pass }, function (error, docs) {
    if (error) {
      res.redirect('/login?status=ErrorinDB')
    }
    else if (docs.length == 0) {
      res.redirect('/login?status=fail')
    }
    else {
      userp = docs;
      console.log(userp);
      res.cookie("username", user)
      db.dbobject.login.find({}, function (error, docs) {

        res.render('userhome', { regusers: docs.length })
      })

    }
  })
});
router.post('/admin_process_login', function (req, res, next) {
  var user = req.body.username;
  var pass = req.body.password;
  db.dbobject.adminlogin.find({ username: user, password: pass }, function (error, docs) {
    if (error) {
      res.redirect('/adminlogin?status=ErrorinDB')
    }
    else if (docs.length == 0) {
      res.redirect('/adminlogin?status=fail')
    }
    else {
      adminp = docs;
      res.cookie("username", user)
      res.render('adminhome')
    }
  })
});
router.post('/uploading', function (req, res, next) {
  var username = req.body.username;
  var emailid = req.body.emailid;
  var clgname = req.body.clgname;
  var regdno = req.body.regdno;
  var sem = req.body.sem;
  var password = req.body.password;
  db.dbobject.login.insert({
    username: username, emailid: emailid, clgname: clgname, regdno: regdno, sem: sem,
    password: password
  }, function (error, doc) {
    if (error)
      console.log(error)
    else {
      res.render('uploading');
    }
  })
})
router.post('/adminuploading', function (req, res, next) {
  var username = req.body.username;
  var emailid = req.body.emailid;
  var clgname = req.body.clgname;
  var empid = req.body.empid;
  var password = req.body.password;
  db.dbobject.adminlogin.insert({
    username: username, emailid: emailid, clgname: clgname, empid: empid,
    password: password
  }, function (error, doc) {
    if (error)
      console.log(error)
    else {
      res.render('adminuploading');
    }
  })
})
router.post('/adminbooks', function (req, res, next) {
  var bsno = req.body.bsno;
  var branch = req.body.branch;
  var subject = req.body.subject;
  var file = req.files.bfile;
  uploadedpath = path.join(__dirname, './uploads/' + branch + '/', file.name);
  console.log(uploadedpath);
  file.mv(uploadedpath, function (error) {
    if (error) {
      res.send("Error");
    }
    else {
      db.dbobject.ebooks.insert({ bsno: bsno, branch: branch, subject: subject, bfile: file }, function (error, doc) {
        if (error)
          console.log(error)
        else
          res.render('adminbooks');
      })
    }
  })
})
router.post('/addtask', function (req, res, next) {
  var event = req.body.event;
  var date = req.body.date;
  var time = req.body.time;
  var userid = userp[0].regdno
  db.dbobject.timetable.insert({ regdno: userid, event: event, date: date, time: time }, function (error, doc) {
    if (error)
      console.log(error);
    else {
      console.log(userp[0].regdno)
      db.dbobject.timetable.find({ regdno: userp[0].regdno }, function (error, docs) {
        res.render('usertimetable', { docs: docs })
      })
    }
  })
})
router.post('/edittask', function (req, res, next) {
  var edit = req.body.edit;
  var editArr = edit.split(",")
  var event = req.body.event;
  var date = req.body.date;
  var time = req.body.time;
  db.dbobject.timetable.remove({ event: editArr[0], date: editArr[1], time: editArr[2], regdno: userp[0].regdno }, function (error, doc) {
    if (error)
      console.log(error);
    else {
      db.dbobject.timetable.insert({ event: event, date: date, time: time, regdno: userp[0].regdno }, function (error, docs) {
        db.dbobject.timetable.find({
          regdno: userp[0].regdno
        }, function (error, docs) {
          res.render('usertimetable', { docs: docs })
        })
      })
    }
  })
})
router.post('/deletetask', function (req, res, next) {
  var del = req.body.delete;
  var delArr = del.split(",");
  console.log(delArr);
  db.dbobject.timetable.remove({ event: delArr[0], date: delArr[1], time: delArr[2] }, function (error, docs) {
    if (error)
      console.log(error)
    else {
      db.dbobject.timetable.find({
        regdno: userp[0].regdno
      }, function (error, docs) {
        res.render('usertimetable', { docs: docs })
      })
    }
  })
})
router.post('/editprofile', function (req, res, next) {
  var edit = req.body.edit;
  var name = req.body.name;
  var emailid = req.body.emailid;
  var clgname = req.body.clgname;
  var regdno = req.body.regdno;
  var sem = req.body.sem;
  db.dbobject.login.remove({ regdno: edit }, function (error, doc) {
    if (error)
      console.log(error);
    else {
      db.dbobject.login.insert({ username: name, emailid: emailid, clgname: clgname, regdno: regdno, sem: sem, password: userp[0].password }, function (error, docs) {
        db.dbobject.login.find({ regdno: regdno }, function (error, docs) {
          res.render('userprofile', { user: docs })
        })
      })
    }
  })
})
router.post('/editpass', function (req, res, next) {
  var cpass = req.body.cpass;
  var upass = req.body.upass;

  db.dbobject.login.remove({ password: cpass }, function (error, doc) {
    if (error)
      console.log(error);
    else {
      db.dbobject.login.insert({ username: userp[0].username, emailid: userp[0].emailid, clgname: userp[0].clgname, regdno: userp[0].regdno, sem: userp[0].sem, password: upass }, function (error, docs) {
        res.render('login');
      })
    }
  })
})
router.post('/editprofilead', function (req, res, next) {
  var edit = req.body.edit;
  var name = req.body.name;
  var emailid = req.body.emailid;
  var clgname = req.body.clgname;
  var empid = req.body.empid;
  console.log(edit);

  db.dbobject.adminlogin.remove({ empid: empid }, function (error, doc) {
    if (error)
      console.log(error);
    else {
      db.dbobject.adminlogin.insert({ username: name, emailid: emailid, clgname: clgname, empid: empid, password: adminp[0].password }, function (error, docs) {
        db.dbobject.adminlogin.find({ empid: empid }, function (error, docs) {
          res.render('adminprofile', { user: docs })
        })
      })
    }
  })
})
router.post('/editpassad', function (req, res, next) {
  var cpass = req.body.cpass;
  var upass = req.body.upass;

  db.dbobject.adminlogin.remove({ password: cpass }, function (error, doc) {
    if (error)
      console.log(error);
    else {
      db.dbobject.adminlogin.insert({ username: adminp[0].username, emailid: adminp[0].emailid, clgname: adminp[0].clgname, empid: adminp[0].empid, password: upass }, function (error, docs) {
        res.render('adminlogin');
      })
    }
  })
})
router.post('/suggestions', function (req, res, next) {
  var user = req.body.user;
  var suggestion = req.body.subject;
  var rating = req.body.star;

  db.dbobject.suggestions.insert({ username: user, suggestion: suggestion, rating: rating }, function (error, docs) {
    if (error)
      console.log(error)
    else {
      res.render('usersuggestions')
    }
  })
})
router.post('/postquery', function (req, res, next) {
  var query = req.body.thread;
  var count = 0;
  db.dbobject.forums.find({}, function (error, docs) {
    count = docs.length
  })
  db.dbobject.forums.insert({ queryNum: count, query: query }, function (error, doc) {
    if (error)
      console.log(error);
    else {
      count += 1
      db.dbobject.forums.find({}, function (error, docs) {
        res.render('userforums', { docs: docs })
      })
    }
  })
})
router.post('/userbooks', function (req, res, next) {
  var branch = req.body.branch;
  db.dbobject.ebooks.find({ branch: branch }, function (error, docs) {
    if (error) {
      res.redirect('/userbooks?status=ErrorinDB')
    }
    else {
      if (branch === "CSE") {
        res.render('usercsebooks', { docs: docs });
      }
      else if (branch === "IT") {
        console.log(docs);
        res.render('useritbooks', { docs: docs });
      }
      else if (branch === "ECE") {
        res.render('userecebooks', { docs: docs });
      }
      else if (branch === "CIVIL") {
        res.render('usercivilbooks', { docs: docs });
      }
      else if (branch === "MECH") {
        res.render('usermechbooks', { docs: docs });
      }
      else if (branch === "EEE") {
        res.render('usereeebooks', { docs: docs });
      }
    }
  })
})
router.get('/register', function (req, res, next) {
  res.render('uploading');
})
router.get('/adminregister', function (req, res, next) {
  res.render('adminuploading');
})
router.get('/userhome', function (req, res, next) {
  var regusers;
  db.dbobject.login.find({}, function (error, docs) {
    regusers = docs.length;
  })
  res.render('userhome', { regusers: regusers });
})
router.get('/userbooks', function (req, res, next) {
  res.render('userbooks');
})
router.get('/userprofile', function (req, res, next) {
  res.render('userprofile', { user: userp });
})
router.get('/useriq', function (req, res, next) {
  res.render('useriq');
})
router.get('/usersoftware', function (req, res, next) {
  res.render('usersoftware');
})
router.get('/userregbooks', function (req, res, next) {
  res.render('userregbooks');
})
router.get('/usercompilers', function (req, res, next) {
  res.render('usercompilers');
})
router.get('/userquiz', function (req, res, next) {
  db.dbobject.quiz.find({}, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('userquiz', { docs: docs })
  })
  // res.render('userquiz');
})
router.get('/usertimetable', function (req, res, next) {
  db.dbobject.timetable.find({
    regdno: userp[0].regdno
  }, function (error, docs) {
    if (error) {
      res.redirect('/usertimetable?status=ErrorinDB')
    }
    else {
      console.log(docs);
      res.render('usertimetable', { docs: docs });
    }
  })
})
router.get('/userforums', function (req, res, next) {
  db.dbobject.forums.find({}, function (error, docs) {
    if (error) {
      console.log(error)
    }
    else {
      res.render('userforums', { docs: docs });
    }
  })
})
router.get('/usersuggestions', function (req, res, next) {
  res.render('usersuggestions', { user: userp });
})
router.get('/adminhome', function (req, res, next) {
  res.render('adminhome');
})
router.get('/adminprofile', function (req, res, next) {
  res.render('adminprofile', { user: adminp });
})
router.get('/adminbooks', function (req, res, next) {
  res.render('adminbooks');
})
router.get('/adminiq', function (req, res, next) {
  res.render('adminiq');
})
router.get('/adminregbooks', function (req, res, next) {
  res.render('adminregbooks');
})
router.get('/adminquiz', function (req, res, next) {
  res.render('adminquiz');
})
router.get('/adminsuggestions', function (req, res, next) {
  db.dbobject.suggestions.find({}, function (error, docus) {
    if (error)
      console.log(error)
    else {
      db.dbobject.suggestions.find({ rating: "1/5" }, function (error, docs1) {
        db.dbobject.suggestions.find({ rating: "2/5" }, function (error, docs2) {
          db.dbobject.suggestions.find({ rating: "3/5" }, function (error, docs3) {
            db.dbobject.suggestions.find({ rating: "4/5" }, function (error, docs4) {
              db.dbobject.suggestions.find({ rating: "5/5" }, function (error, docs5) {
                res.render('adminsuggestions', { docs: docus, rating1: docs1.length, rating2: docs2.length, rating3: docs3.length, rating4: docs4.length, rating5: docs5.length });
              })
            })
          })
        })
      })
    }
  })
})

router.post('/iqc', function (req, res, next) {
  var sub = "C Programming";
  db.dbobject.iq.find({ sub: sub }, function (error, docs) {
    console.log(docs);
    res.render('iqc', { docs: docs });
  })
})

router.post('/adminiq', function (req, res, next) {
  var sub = req.body.sub;
  var ques = req.body.ques;
  var ans = req.body.ans;
  db.dbobject.iq.insert({ sub: sub, ques: ques, ans: ans }, function (error, docs) {
    if (error)
      res.send("Error....");
    else
      res.render('adminiq');
  })
})

router.get('/R16-civil-menu', function (req, res, next) {
  res.render('R16-civil-menu');
})
router.get('/R16-cse-menu', function (req, res, next) {
  res.render('R16-cse-menu');
})
router.get('/R16-it-menu', function (req, res, next) {
  res.render('R16-it-menu');
})
router.get('/R16-ece-menu', function (req, res, next) {
  res.render('R16-ece-menu');
})
router.get('/R16-eee-menu', function (req, res, next) {
  res.render('R16-eee-menu');
})
router.get('/R16-mech-menu', function (req, res, next) {
  res.render('R16-mech-menu');
})

router.get('/adminlab', function (req, res, next) {
  res.render('adminlab');
})
router.get('/adminqa', function (req, res, next) {
  res.render('adminqa');
})
router.get('/adminmaterials', function (req, res, next) {
  res.render('adminmaterials');
})

router.post('/adminmaterials', function (req, res, next) {
  var branch = req.body.branch;
  var semester = req.body.semester;
  var sub = req.body.subject;
  var file = req.files.bfile;
  uploadedpath = path.join(__dirname, './uploads/Materials/' + branch + '/', file.name);
  file.mv(uploadedpath, function (error) {
    if (error) {
      res.send(error);
    }
    else {
      db.dbobject.adminmaterials.insert({ branch: branch, semester: semester, subject: sub, bfile: file }, function (error, doc) {
        if (error)
          console.log(error)
        else
          res.render('adminregbooks')
      })
    }
  })
})
router.get('/adminsyllabus', function (req, res, next) {
  res.render('adminsyllabus');
})
router.post('/adminsyllabus', function (req, res, next) {
  var branch = req.body.branch;
  var semester = req.body.semester;
  var file = req.files.bfile;
  uploadedpath = path.join(__dirname, './uploads/Syllabus/' + branch + '/', file.name);
  file.mv(uploadedpath, function (error) {
    if (error) {
      res.send(error);
    }
    else {
      db.dbobject.adminsyllabus.insert({ branch: branch, semester: semester, bfile: file }, function (error, doc) {
        if (error)
          console.log(error)
        else
          res.render('adminregbooks')
      })
    }
  })
})

router.get('/R16-cse-syllabus', function (req, res, next) {
  db.dbobject.adminsyllabus.find({ branch: "CSE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-syllabus', { docs: docs });
  })
})
router.get('/R16-cse-notes', function (req, res, next) {
  res.render('R16-cse-notes');
})
router.get('/R16-cse-previous_papers', function (req, res, next) {
  res.render('R16-cse-previous_papers');
})

router.get('/R16-it-syllabus', function (req, res, next) {
  db.dbobject.adminsyllabus.find({ branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-syllabus', { docs: docs });
  })

})
router.get('/R16-it-notes', function (req, res, next) {
  res.render('R16-it-notes');
})
router.get('/R16-it-previous_papers', function (req, res, next) {
  res.render('R16-it-previous_papers');
})

router.get('/R16-eee-syllabus', function (req, res, next) {
  db.dbobject.adminsyllabus.find({ branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-syllabus', { docs: docs });
  })
})
router.get('/R16-eee-notes', function (req, res, next) {
  res.render('R16-eee-notes');
})
router.get('/R16-eee-previous_papers', function (req, res, next) {
  res.render('R16-eee-previous_papers');
})

router.get('/R16-ece-syllabus', function (req, res, next) {
  db.dbobject.adminsyllabus.find({ branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-syllabus', { docs: docs });
  })
})
router.get('/R16-ece-notes', function (req, res, next) {
  res.render('R16-ece-notes');
})
router.get('/R16-ece-previous_papers', function (req, res, next) {
  res.render('R16-ece-previous_papers');
})

router.get('/R16-mech-syllabus', function (req, res, next) {
  db.dbobject.adminsyllabus.find({ branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-syllabus', { docs: docs });
  })
})
router.get('/R16-mech-notes', function (req, res, next) {
  res.render('R16-mech-notes');
})
router.get('/R16-mech-previous_papers', function (req, res, next) {
  res.render('R16-mech-previous_papers');
})

router.get('/R16-civil-syllabus', function (req, res, next) {
  db.dbobject.adminsyllabus.find({ branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-syllabus', { docs: docs });
  })
})
router.get('/R16-civil-notes', function (req, res, next) {
  res.render('R16-civil-notes');
})
router.get('/R16-civil-previous_papers', function (req, res, next) {
  res.render('R16-civil-previous_papers');
})

router.get('/R16-cse-notes-1-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-1", branch: "CSE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-notes-1-1', { docs: docs });
  })

})
router.get('/R16-cse-notes-1-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-2", branch: "CSE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-notes-1-2', { docs: docs });
  })
})
router.get('/R16-cse-notes-2-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({
    semester: "2-1", branch: "CSE"
  }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-notes-2-1', { docs: docs });
  })
})
router.get('/R16-cse-notes-2-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({
    semester: "2-2", branch: "CSE"
  }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-notes-2-2', { docs: docs });
  })
})
router.get('/R16-cse-notes-3-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-1", branch: "CSE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-notes-3-1', { docs: docs });
  })
})
router.get('/R16-cse-notes-3-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-2", branch: "CSE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-notes-3-2', { docs: docs });
  })
})
router.get('/R16-cse-notes-4-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-1", branch: "CSE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-notes-4-1', { docs: docs });
  })
})
router.get('/R16-cse-notes-4-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-2", branch: "CSE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-cse-notes-4-2', { docs: docs });
  })
})

router.get('/R16-it-notes-1-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-1", branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-notes-1-1', { docs: docs });
  })
})
router.get('/R16-it-notes-1-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-2", branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-notes-1-2', { docs: docs });
  })
})
router.get('/R16-it-notes-2-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-1", branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-notes-2-1', { docs: docs });
  })
})
router.get('/R16-it-notes-2-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-2", branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-notes-2-2', { docs: docs });
  })
})
router.get('/R16-it-notes-3-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-1", branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-notes-3-1', { docs: docs });
  })
})
router.get('/R16-it-notes-3-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-2", branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-notes-3-2', { docs: docs });
  })
})
router.get('/R16-it-notes-4-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-1", branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-notes-4-1', { docs: docs });
  })
})
router.get('/R16-it-notes-4-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-2", branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-it-notes-4-2', { docs: docs });
  })
})

router.get('/R16-ece-notes-1-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-1", branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-notes-1-1', { docs: docs });
  })
})
router.get('/R16-ece-notes-1-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-2", branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-notes-1-2', { docs: docs });
  })
})
router.get('/R16-ece-notes-2-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-1", branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-notes-2-1', { docs: docs });
  })
})
router.get('/R16-ece-notes-2-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-2", branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-notes-2-2', { docs: docs });
  })
})
router.get('/R16-ece-notes-3-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-1", branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-notes-3-1', { docs: docs });
  })
})
router.get('/R16-ece-notes-3-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-2", branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-notes-3-2', { docs: docs });
  })
})
router.get('/R16-ece-notes-4-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-1", branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-notes-4-1', { docs: docs });
  })
})
router.get('/R16-ece-notes-4-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-2", branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-ece-notes-4-2', { docs: docs });
  })
})

router.get('/R16-eee-notes-1-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-1", branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-notes-1-1', { docs: docs });
  })
})
router.get('/R16-eee-notes-1-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-2", branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-notes-1-2', { docs: docs });
  })
})
router.get('/R16-eee-notes-2-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-1", branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-notes-2-1', { docs: docs });
  })
})
router.get('/R16-eee-notes-2-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-2", branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-notes-2-2', { docs: docs });
  })
})
router.get('/R16-eee-notes-3-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-1", branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-notes-3-1', { docs: docs });
  })
})
router.get('/R16-eee-notes-3-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-2", branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-notes-3-2', { docs: docs });
  })
})
router.get('/R16-eee-notes-4-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-2", branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-notes-3-2', { docs: docs });
  })
})
router.get('/R16-eee-notes-4-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-2", branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-eee-notes-4-2', { docs: docs });
  })
})

router.get('/R16-civil-notes-1-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-1", branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-notes-1-1', { docs: docs });
  })
})
router.get('/R16-civil-notes-1-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-2", branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-notes-1-2', { docs: docs });
  })
})
router.get('/R16-civil-notes-2-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-1", branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-notes-2-1', { docs: docs });
  })
})
router.get('/R16-civil-notes-2-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-2", branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-notes-2-2', { docs: docs });
  })
})
router.get('/R16-civil-notes-3-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-1", branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-notes-3-1', { docs: docs });
  })
})
router.get('/R16-civil-notes-3-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-2", branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-notes-3-2', { docs: docs });
  })
})
router.get('/R16-civil-notes-4-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-1", branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-notes-4-1', { docs: docs });
  })
})
router.get('/R16-civil-notes-4-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-2", branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-civil-notes-4-2', { docs: docs });
  })
})

router.get('/R16-mech-notes-1-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-1", branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-notes-1-1', { docs: docs });
  })
})
router.get('/R16-mech-notes-1-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "1-2", branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-notes-1-2', { docs: docs });
  })
})
router.get('/R16-mech-notes-2-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-1", branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-notes-2-1', { docs: docs });
  })
})
router.get('/R16-mech-notes-2-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "2-2", branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-notes-2-2', { docs: docs });
  })
})
router.get('/R16-mech-notes-3-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-1", branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-notes-3-1', { docs: docs });
  })
})
router.get('/R16-mech-notes-3-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "3-2", branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-notes-3-2', { docs: docs });
  })
})
router.get('/R16-mech-notes-4-1', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-1", branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-notes-4-1', { docs: docs });
  })
})
router.get('/R16-mech-notes-4-2', function (req, res, next) {
  db.dbobject.adminmaterials.find({ semester: "4-2", branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error);
    else
      res.render('R16-mech-notes-4-2', { docs: docs });
  })
})
router.get('/admincsequiz', function (req, res, next) {
  res.render('admincsequiz');
})
router.post('/admincsequiz', function (req, res, next) {
  var sub = req.body.sub;
  var noofq = req.body.noofq;
  res.render('csequiz', { sub: sub, noofq: noofq });
})
router.get('/adminitquiz', function (req, res, next) {
  res.render('adminitquiz');
})
router.post('/adminitquiz', function (req, res, next) {
  var sub = req.body.sub;
  var noofq = req.body.noofq;
  res.render('itquiz', { sub: sub, noofq: noofq });
})
router.get('/adminecequiz', function (req, res, next) {
  res.render('adminecequiz');
})
router.post('/adminecequiz', function (req, res, next) {
  var sub = req.body.sub;
  var noofq = req.body.noofq;
  res.render('ecequiz', { sub: sub, noofq: noofq });
})
router.get('/admineeequiz', function (req, res, next) {
  res.render('admineeequiz');
})
router.post('/admineeequiz', function (req, res, next) {
  var sub = req.body.sub;
  var noofq = req.body.noofq;
  res.render('eeequiz', { sub: sub, noofq: noofq });
})
router.get('/adminmechquiz', function (req, res, next) {
  res.render('adminmechquiz');
})
router.post('/adminmechquiz', function (req, res, next) {
  var sub = req.body.sub;
  var noofq = req.body.noofq;
  res.render('mechquiz', { sub: sub, noofq: noofq });
})
router.get('/admincivilquiz', function (req, res, next) {
  res.render('admincivilquiz');
})
router.post('/admincivilquiz', function (req, res, next) {
  var sub = req.body.sub;
  var noofq = req.body.noofq;
  res.render('civilquiz', { sub: sub, noofq: noofq });
})

router.get('/usercsequiz', function (req, res, next) {
  res.render('usercsequiz');
})
router.post('/usercsequiz', function (req, res, next) {
  var sub = req.body.sub;
  db.dbobject.quiz.find({ sub: sub, branch: "CSE" }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('quiz', { docs: docs });
  })
})
router.post('/useritquiz', function (req, res, next) {
  var sub = req.body.sub;
  db.dbobject.quiz.find({ sub: sub, branch: "IT" }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('quiz', { docs: docs });
  })
})
router.get('/useritquiz', function (req, res, next) {
  res.render('useritquiz');
})
router.post('/userecequiz', function (req, res, next) {
  var sub = req.body.sub;
  db.dbobject.quiz.find({ sub: sub, branch: "ECE" }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('quiz', { docs: docs });
  })
})
router.get('/userecequiz', function (req, res, next) {
  res.render('userecequiz');
})
router.post('/usereeequiz', function (req, res, next) {
  var sub = req.body.sub;
  db.dbobject.quiz.find({ sub: sub, branch: "EEE" }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('quiz', { docs: docs });
  })
})
router.get('/usereeequiz', function (req, res, next) {
  res.render('usereeequiz');
})
router.post('/usermechquiz', function (req, res, next) {
  var sub = req.body.sub;
  db.dbobject.quiz.find({ sub: sub, branch: "MECH" }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('quiz', { docs: docs });
  })
})
router.get('/usermechquiz', function (req, res, next) {
  res.render('usermechquiz');
})
router.post('/usercivilquiz', function (req, res, next) {
  var sub = req.body.sub;
  db.dbobject.quiz.find({ sub: sub, branch: "CIVIL" }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('quiz', { docs: docs });
  })
})
router.get('/usercivilquiz', function (req, res, next) {
  res.render('usercivilquiz');
})
router.get('/csequiz', function (req, res, next) {
  res.render('csequiz');
})

router.post('/csequiz', function (req, res, next) {
  var ques = req.body.ques;
  var opt1 = req.body.opt1;
  var opt2 = req.body.opt2;
  var opt3 = req.body.opt3;
  var opt4 = req.body.opt4;
  var ans = req.body.ans;
  var sub = req.body.sub;
  var noofq = req.body.noofq;

  db.dbobject.quiz.insert({ sub: sub, branch: "CSE", question: ques, correctanswer: ans, answers: { opt1: opt1, opt2: opt2, opt3: opt3, opt4: opt4 } }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('csequiz', { noofq: noofq, sub: sub });

  })
})
router.get('/itquiz', function (req, res, next) {
  res.render('itquiz');
})

router.post('/itquiz', function (req, res, next) {
  var ques = req.body.ques;
  var opt1 = req.body.opt1;
  var opt2 = req.body.opt2;
  var opt3 = req.body.opt3;
  var opt4 = req.body.opt4;
  var ans = req.body.ans;
  var sub = req.body.sub;
  var noofq = req.body.noofq;

  db.dbobject.quiz.insert({ sub: sub, branch: "IT", question: ques, correctanswer: ans, answers: { opt1: opt1, opt2: opt2, opt3: opt3, opt4: opt4 } }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('itquiz', { noofq: noofq, sub: sub });

  })
})
router.get('/ecequiz', function (req, res, next) {
  res.render('ecequiz');
})

router.post('/ecequiz', function (req, res, next) {
  var ques = req.body.ques;
  var opt1 = req.body.opt1;
  var opt2 = req.body.opt2;
  var opt3 = req.body.opt3;
  var opt4 = req.body.opt4;
  var ans = req.body.ans;
  var sub = req.body.sub;
  var noofq = req.body.noofq;

  db.dbobject.quiz.insert({ sub: sub, branch: "ECE", question: ques, correctanswer: ans, answers: { opt1: opt1, opt2: opt2, opt3: opt3, opt4: opt4 } }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('ecequiz', { noofq: noofq, sub: sub });

  })
})
router.get('/eeequiz', function (req, res, next) {
  res.render('eeequiz');
})

router.post('/eeequiz', function (req, res, next) {
  var ques = req.body.ques;
  var opt1 = req.body.opt1;
  var opt2 = req.body.opt2;
  var opt3 = req.body.opt3;
  var opt4 = req.body.opt4;
  var ans = req.body.ans;
  var sub = req.body.sub;
  var noofq = req.body.noofq;

  db.dbobject.quiz.insert({ sub: sub, branch: "EEE", question: ques, correctanswer: ans, answers: { opt1: opt1, opt2: opt2, opt3: opt3, opt4: opt4 } }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('eeequiz', { noofq: noofq, sub: sub });

  })
})
router.get('/mechquiz', function (req, res, next) {
  res.render('mechquiz');
})

router.post('/mechquiz', function (req, res, next) {
  var ques = req.body.ques;
  var opt1 = req.body.opt1;
  var opt2 = req.body.opt2;
  var opt3 = req.body.opt3;
  var opt4 = req.body.opt4;
  var ans = req.body.ans;
  var sub = req.body.sub;
  var noofq = req.body.noofq;

  db.dbobject.quiz.insert({ sub: sub, branch: "MECH", question: ques, correctanswer: ans, answers: { opt1: opt1, opt2: opt2, opt3: opt3, opt4: opt4 } }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('mechquiz', { noofq: noofq, sub: sub });

  })
})
router.get('/civilquiz', function (req, res, next) {
  res.render('civilquiz');
})

router.post('/civilquiz', function (req, res, next) {
  var ques = req.body.ques;
  var opt1 = req.body.opt1;
  var opt2 = req.body.opt2;
  var opt3 = req.body.opt3;
  var opt4 = req.body.opt4;
  var ans = req.body.ans;
  var sub = req.body.sub;
  var noofq = req.body.noofq;

  db.dbobject.quiz.insert({ sub: sub, branch: "CIVIL", question: ques, correctanswer: ans, answers: { opt1: opt1, opt2: opt2, opt3: opt3, opt4: opt4 } }, function (error, docs) {
    if (error)
      console.log(error)
    else
      res.render('civilquiz', { noofq: noofq, sub: sub });

  })
})
router.get('/logout', function (req, res, next) {
  res.clearCookie('username')
  res.render('login', { msg: '' })
})
module.exports = router;
