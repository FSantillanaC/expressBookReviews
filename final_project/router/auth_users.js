const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send(JSON.stringify({message: "User successfully logged in" /*, token: accessToken*/},null,4));
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.body.username;
    const review = req.body.review;
    if(!isbn||!username||!review){
      return res.status(400).json({message: "Error: Invalid request!"});
    }
    if(!isValid(username)){
      return res.status(400).json({message: "Error: Invalid username!"});
    }
    if(!books[isbn]){
      return res.status(400).json({message: "Error: Invalid ISBN!"});
    }
    books[isbn].reviews[username]=review;
    return res.status(200).json({message: "Review added successfully!"});
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.body.username;
    if(!isbn||!username){
      return res.status(400).json({message: "Error: Invalid request!"});
    }
    if(!isValid(username)){
      return res.status(400).json({message: "Error: Invalid username!"});   
    }
    if(!books[isbn]){
      return res.status(400).json({message: "Error: Invalid ISBN!"});
    }
    delete books[isbn].reviews[username];
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
