/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const Book = require("../models/bookModel");

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = await Book.find({}).select("_id title comments")
        if (books) {          
          console.log("Book list found.", books);          
          res.json(books.map(book => {
            return {
              _id: book._id,
              title: book.title,
              commentcount: book.comments.length
            }
          }));
          
        } else {
          console.log("No books found");
          res.json({ message: "No books found" });
        }

      } catch (error) {
        console.log(`Error getting all books: ${error}`);
        res.json({ message: `Error getting all books: ${error}` })
      }
    })
    
    .post(async function (req, res){
      try {
        const title = req.body.title;
        const newBook = new Book({ title });
        const book = await newBook.save();
        if (book) {
          console.log(`New book created: ${book}`);
          res.status(200).json({
            message: "New book created",
            _id: book._id,
            title: book.title
          })
        } else {
          console.log(`Book creation failed.`)
          res.status(400).json({
            message: `Book creation failed`
          })
        }

      } catch (error) {
        console.log(`Error creating book: ${error}`);
        res.status(400).json({message: "No book id provided"});
      }      
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      try {
        const books = await Book.deleteMany({});
        if (books) {
          console.log("Complete delete successful");
          res.send("Complete delete successful");

        } else {
          console.log("Cannot delete all");
          res.send("Cannot delete all");
        }

      } catch (error) {
        console.log(`Error deleting all: ${error}`);
        res.send("Error deleting all");
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const { id } = req.params;
        const book = await Book.findById(id).select("_id title comments");

        if (book) {
          console.log(`Book found ${book}`);
          res.json(book);

        } else {
          console.log(`Book with id: ${id} not found`);
          res.json({ message: `Book with id: ${id} not found` });
        }
        
      } catch (error) {
        console.log(`Book get error: ${error}`);
        res.status(400).send("No book exists");
      }
    })
    
    .post(async function(req, res){
      //json res format same as .get
      try {
        const { id } = req.params;
        const { comment } = req.body;

        const book = await Book.findByIdAndUpdate(id, 
          { $push: { comments: comment } }, 
          { new: true });

        if (book) {
          console.log(`Comment added to book: ${book}`);
          res.json(book);

        } else {
          console.log(`Book with id: ${id} not found`);
          res.json({ message: `Book with id: ${id} not found` });
        }
        
      } catch (error) {
        console.log(`Book get error: ${error}`);
        res.send("No book exists");
      }
    })
    
    .delete(async function(req, res){
      //if successful response will be 'delete successful'
      try {
        const { id } = req.params;
        const book = await Book.findByIdAndDelete(id);
        if (book) {
          console.log(`Book with id: ${id} deleted successfully.`);
          res.send(`Book with id: ${id} deleted successfully.`);

        } else {
          console.log(`Book with id: ${id} deletion failed.`);
          res.send(`Book with id: ${id} deletion failed.`);
        }
        
      } catch (error) {
        console.log(`Error deleting book: ${error}`);
        res.send(`Error deleting book: ${error}`);
      }
    });
  
};
