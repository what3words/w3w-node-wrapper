var should = require('should');

describe('Suite two', function(){
  describe('Describe 1', function() {
    it('should be true', function() {
      ({ foo: 'bar' }).should.eql({ foo: 'bar' });
    });
  });
});
