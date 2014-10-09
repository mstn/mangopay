var _ = require('lodash')
  , assert = require('chai').assert
  , expect = require('chai').expect
  , Mango = require('../index')
  , Creds = require('./__credentials.json')
  , mango = Mango({
      username: Creds.username,
      password: Creds.password
    })

describe('Test cards', function(){

  it('create a registration object for an existing user', function(done){
    this.timeout(5000);
    mango.card.create({
      'Currency':'EUR',
      'UserId':'2565355'
    }, function(err, card, res){

      assert.isNull(err);
      assert.property(card, 'Id');
      assert.property(card, 'AccessKey');
      assert.property(card, 'PreregistrationData');
      assert.property(card, 'CardRegistrationURL');
      assert.property(card, 'Currency');
      assert.property(card, 'UserId');

      done();
    });
  });

  it('complete registration for an existing user in a single step', function(done){
    this.timeout(20000);
    mango.card.register({
      'Currency':'EUR',
      'UserId':'2565355',
      'CardNumber':'4970100000000154',
      'CardExpirationDate':'0216',
      'CardCvx':'123'
    }, function(err, card, res) {
        assert.isNull(err);
        assert.property(card, 'Id');
        assert.property(card, 'AccessKey');
        assert.property(card, 'PreregistrationData');
        assert.property(card, 'CardRegistrationURL');
        assert.property(card, 'Currency');
        assert.property(card, 'UserId');
        assert.property(card, 'CardId');
        assert.isDefined(card['CardId']);

        done();
    });
  });

})
