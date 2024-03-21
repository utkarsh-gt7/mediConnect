import express, { response } from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import session from "express-session";
import flash from "express-flash";
import passport from "passport";
import initializePassport from "./passportConfig.js"
import db from "./dbConfig.js";
import gravatar from "gravatar";

const app = express();
const port = 3000;

//All middlewares
initializePassport(passport);
app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.static("css"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Email functionality
const my_email = process.env.MY_EMAIL;
const my_pass = process.env.MY_PASS;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: my_email,
        pass: my_pass
    }
});
function sendMail(name, Semail, subject, message) {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: Semail,
        to: my_email,
        subject: subject + ' Message from ' + name,
        text: message + ' from ' + Semail
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          reject(false);
        } else {
          console.log('Email sent: ' + info.response);
          resolve(true);
        }
      });
    });
}
app.post("/contact-me", async (req, res) => {
    const name = req.body.name;
    const Semail = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    try {
        // Send email and get the result
        const emailSent = await sendMail(name, Semail, subject, message);
    
        // Respond to the client based on the result
        res.render("contact.ejs", {message: "Done"});
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.render("contact.ejs", {message: "Not Done"});
    }  
});

//All get routes
app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM upComingSeminars");
    console.log(result);
    res.render("index.ejs", {user: req.user, seminars: result.rows});
});
app.get('/dashboard', checkNotAuthenticated, (req, res) => {
    const coun_ID = req.body.id;
    const appointments = db.query("SELECT * FROM appointments WHERE counsellor_id = $1", [req.user.id]);
    res.render('dashboard', {user: req.user.name, appointments: appointments});
});
app.get("/login", checkAuthenticated, (req, res) => {
    res.render("login.ejs", {user: req.user});
});
  
// app.get("/register", checkAuthenticated, (req, res) => {
//     res.render("registration.ejs", {user: req.user});
// });
app.get("/contact", (req, res) => {
    res.render("contact.ejs", {user: req.user});
});
  
app.get("/about", (req, res) => {
    res.render("about.ejs", {user: req.user});
});

// app.get("/seminar", (req, res) => {
//     const seminarID = req.body.id;
//     const seminar = db.query();
//     res.render("seminar.ejs", {seminar: seminar});
// })

// app.get("/counsellor", (req, res) => {
//     const counID = req.body.id;
//     const counsellor = db.query();
//     res.render("counseller.ejs", {counsellor: counsellor});
// })

// app.get("/review", (req, res) => {
//     const reviewID = req.body.id;
//     const review = db.query();
//     res.render("review.ejs", {review: review});
// })

app.get("/create-seminar", isCounsellor, (req, res) => {
    res.render("seminar.ejs");
})

app.get("/postYourReview", checkNotAuthenticated, (req, res) => {
    res.render("review.ejs");
})

app.get("/counsellorDashboard", isCounsellor, (req, res) => {
    const counsellorID = req.user.id;
    const counsellor = db.query("SELECT * FROM users where id = $1 AND role = $2", [req.user.id, req.user.role]);
    const appointments = db.query("SELECT * FROM upComingAppointments where counsellor_id = $1", [req.user.id]);
    res.render("dashboard.ejs", {counsellor: counsellor}, {appointments: appointments});
})

//All post routes

app.post("/register", async (req, res) => {
    if(req.body.type === "register"){
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const password2 = req.body.password2;
        //Form Validation steps
        let errors = [];
        if(!name || !email || !password || !password2 || !req.body.role){
            errors.push({message:"Please fill in all fields."});
        }
        if(password !== password2){
            errors.push({message: "Passwords do not match"});
        }
        if(password.length < 6){
            errors.push( { message: "Password must be at least 6 characters long."})
        }
        //Handling validation errors.
        if(errors.length > 0){
            res.render('registration', {errors});
        }else{
            //Form validation has passed, generating a hash for the user.
            let hashedPassword;
            let gravatarUrl;
            try {
            gravatarUrl = gravatar.url(email, { s: '200', d: 'identicon', r: 'pg' });
            hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(password, 10, (err, hash) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log('Hashed Password: ', hash);
                        resolve(hash);
                    }
                });
            });
        
            console.log("outside");
            console.log(hashedPassword);
            } catch (error) {
                // Handle errors here
                console.error(error);
                res.render('error', { message: 'Internal Server Error' });
            }
            let result = await db.query('SELECT * FROM users WHERE email = $1', [email], (err, results)=>{
                if(err){
                    console.error(err);
                }else{
                    console.log(results.rows);
                    if(results.rows.length > 0){
                        errors.push({message:  'Email already exists.'});
                        res.render("registration", {errors})
                    }else{
                        result = db.query(
                            'INSERT INTO users (name, email, password, image_url, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, password',
                            [name, email, hashedPassword, gravatarUrl, req.body.role],
                            (err, results) => {
                                if(err){
                                    throw err;
                                }
                                console.log(results.rows);
                                req.flash('success_msg','You are now registered and can log in');
                                res.redirect("/login");
                            }
                        )
                    }
                }
            })
        }
    }else if(req.body.type === "login"){
        res.redirect("/login");
    }
})



app.post("/postYourReview",checkNotAuthenticated, (req, res) => {
    const user_id = req.user.id;
    const content = req.body.content;
    const brief = req.body.brief;
    const rating = req.body.star;
    
    //Date calculation.
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yy = String(today.getFullYear()).slice(-2);
    const formattedDate = dd + '-' + mm + '-' + yy;

    const result = db.query("INSERT INTO testimonials (user_id, brief, date, rating, content) VALUES ($1, $2, $3, $4, $5)", [user_id, brief, formattedDate, rating, content]);
    res.redirect("/");
})

app.post("/create-seminar", checkNotAuthenticated, (req, res) => {
    const joinLink = String(Math.floor(Math.random() * 10000));
    //Date calculation.
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yy = String(today.getFullYear()).slice(-2);
    const formattedDate = dd + '-' + mm + '-' + yy;
    const guestName = req.body.guestName;
    const guestDesc = req.body.guestDescription;
    const guest_Img_Url = req.body.guest_Img_Url;
    
    const result = db.query("INSERT INTO upComingSeminars (joinLink, date, guestName, guestDescription, guest_Img_Url) VALUES ($1, $2, $3, $4, $5)", [joinLink, formattedDate, guestName, guestDesc, guest_Img_Url]);
    res.redirect("/");
})

app.get("/lobby", (req, res) => {
    res.render("lobby.ejs");
})

app.get("/room", (req, res) => {
    res.render("room.ejs");
})

//Passport functionality
app.post("/login", passport.authenticate("local", {
    successRedirect:"/",
    failureRedirect:'/login',
    failureFlash: true
}));

app.get("/logout",  (req, res) => {
    req.logOut((err) => {
        if(err){
            console.error(err);
            res.redirect("/");
        }
    });
    req.flash('success_msg', 'You have logged out');
    res.redirect("/");
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/");
    }
    next();
}
  
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function isCounsellor(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'counsellor') {
      return next();
    }
    res.redirect('/');
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});