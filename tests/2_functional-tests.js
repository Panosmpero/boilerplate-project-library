/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { suite, test } = require("mocha");
const Book = require("../models/bookModel");


chai.use(chaiHttp);

// Helper test functions
const createBook = async (done, title, callback) => {
  try {
    const b = new Book({ title });
    const newBook = await b.save();
    if (newBook) {
      console.log("New book created");
      if (callback) callback(newBook._id);
      done();

    } else {
      console.log("Could not create new book");
      done();
    }
    
  } catch (error) {
    console.log("Error creating new book" + error);
    done();
  }
};

const deleteBook = async (done, search_param) => {
  try {
    const book = await Book.findOneAndDelete(search_param);
    if (book) {
      console.log("Book deleted." + book._id)
      done();

    } else {
      console.log("Book deletion failed.");
      done();
    }

  } catch (error) {
    console.log("Delete error: " + error);
    done();
  }
}

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {        

        chai.request(server)
          .post("/api/books")
          .send({ title: "Test book title1" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, "message", "New book created", "should contain a new book created message");
            assert.propertyVal(res.body, "title", "Test book title1", "property should have the Test book title");
            done();
          });        
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post("/api/books")
          .end((err, res) => {
            assert.equal(res.status, 400)
            done();
          })
      }); 
      
      after(done => {
        deleteBook(done, { title: "Test book title1" })
      });

    });


    suite('GET /api/books => array of books', function(){
      let testId;

      before(done => {
        createBook(done, "Test book title2", (id) => {
          testId = id;
          return;
        })
      });
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[res.body.length - 1], '_id', 'Books in array should contain _id');
            assert.property(res.body[res.body.length - 1], 'title', 'Books in array should contain title');
            assert.property(res.body[res.body.length - 1], 'commentcount', 'Books in array should contain commentcount');
            done();
          });
      });      
      
      after(done => {
        deleteBook(done, { _id: testId })
      });

    });


    suite('GET /api/books/[id] => book object with [id]', function(){

      let testId;

      before(done => {
        createBook(done, "Test book title3", (id) => {
          testId = id;
          return;
        })
      });      
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get("/api/books/testid123")
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, "No book exists");
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get(`/api/books/${testId}`)
          .end((err, res) => {
            assert.equal(res.status, 200);
            console.log("AAAAAAAAAAAAAAAAAAAAAAA", res.body, res.body.title)
            assert.isArray(res.body.comments, "comments should be an array");
            assert.equal(res.body._id, testId);
            assert.equal(res.body.title, "Test book title3");
            // assert.propertyVal(res.body, "title", "Test book title3", "property should have the Test book title3");
            // assert.propertyVal(res.body, "_id", testId, "property should have the Test book title3");
            done();
          });
      }); 
      
      after(done => {
        deleteBook(done, { _id: testId })
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){

      let testId;

      before(done => {
        createBook(done, "Test book title4", (id) => {
          testId = id;
          return;
        })
      });      
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post(`/api/books/${testId}`)
          .send({ comment: "Test comment" })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.comments.length, 1);
            assert.equal(res.body.comments[0], "Test comment");
            done();
          });
      }); 
      
      after(done => {
        deleteBook(done, { _id: testId })
      });

    });
  });
});
