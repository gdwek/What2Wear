const expect  = require('chai').expect;
const request = require('request');
const chai = require("chai");
const sinon = require("sinon");
// const faker = require("faker");
// const { User } = require("../db");
// const app = require("../app");

  describe ('home page', function() {
      it('status', function(done){
          request('https://enigmatic-wave-01914.herokuapp.com', function(error, response, body) {
              expect(response.statusCode).to.equal(200);
              done();
          });
      });
  });

  describe ('login', function() {
    it('status', function(done){
        request('https://enigmatic-wave-01914.herokuapp.com/login', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});

describe ('login', function() {
    it('status', function(done){
        request('https://enigmatic-wave-01914.herokuapp.com/signup', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});

describe ('accessing view without logging in', function() {
    it('status', function(done){
        request('https://enigmatic-wave-01914.herokuapp.com/view', function(error, response, body) {
            expect(response.statusCode).to.equal(503);
            done();
        });
    });
});

  // describe("app", function() {
  //   const stubValue = {
  //     name: faker.name.findName(),
  //     password: faker.internet.password(),
  //     zipcode: faker.address.zipCode(),
  //   };
  //   describe("signup", function() {
  //     it("should add a new user to the db", async function() {
  //       const stub = sinon.stub(UserModel, "create").returns(stubValue);
  //       const userRepository = new UserRepository();
  //       const user = await userRepository.create(stubValue.name, stubValue.email);
  //       expect(stub.calledOnce).to.be.true;
  //       expect(user.id).to.equal(stubValue.id);
  //       expect(user.name).to.equal(stubValue.name);
  //       expect(user.email).to.equal(stubValue.email);
  //       expect(user.createdAt).to.equal(stubValue.createdAt);
  //       expect(user.updatedAt).to.equal(stubValue.updatedAt);
  //     });
  //   });
  // });

  // describe ('About page', function() {
  //     it('status', function(done){
  //         request('http://localhost:8080/about', function(error, response, body) {
  //             expect(response.statusCode).to.equal(404);
  //             done();
  //         });
  //     });

  // });
