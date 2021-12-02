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

describe ('signup', function() {
    it('status', function(done){
        request('https://enigmatic-wave-01914.herokuapp.com/signup', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});

describe ('accessing view without logging in', function() {
    it('status', function(done){
        request('https://enigmatic-wave-01914.herokuapp.com/zipcode', function(error, response, body) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});

  