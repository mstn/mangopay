/**
 *  It implements the card registration workflow
 *  @see http://docs.mangopay.com/api-references/card-registration/
 */


var httpClient = require('../lib/httpClient')
  , httpMethod = require('../lib/httpMethod')
  , error = require('../lib/error')
  , utils = require('../lib/utils')

var https = require('https')
var qs = require('querystring')
var Url = require('url')

module.exports = httpClient.extend({

  path: 'cardregistrations',

  includeBasic: [ ],

  methods: {

    /**
     *  Create a CardRegistration object.
     */
    create: httpMethod({
      method: 'POST',
      path: '',
      params: {
          'UserId': { required: true }
        , 'Currency': { required: true, default: 'EUR' }
      }
    }),

    /**
     * Create a CardRegistration object and send card details in a single step
     */
    register: httpMethod({
      method: 'POST',
      path:'',
      params: {
          'UserId': { required: true }
        , 'Currency': { required: true, default: 'EUR' }
        , 'CardNumber': { required: true }
        , 'CardExpirationDate': { required: true }
        , 'CardCvx': { required: true }
      }
    }, function(err, body, res, params, next){
        var self = this

        if(err)
          return next(err, null, res)

        // after obtaining a cardRegistration object
        // we send the card details to the PSP (payline) url
        var cardDetails = {
          data: body.PreregistrationData,
          accessKeyRef: body.AccessKey,
          cardNumber: params.CardNumber,
          cardExpirationDate: params.CardExpirationDate,
          cardCvx: params.CardCvx
        }

        this.sendCardDetails.call(self, body, cardDetails, next)
      }
    ),

    sendCardDetails: function(cardRegistration, cardDetails, next){
      var self = this

      // parse CardRegistrationURL & urlencode cardDetails
      var url = Url.parse(cardRegistration.CardRegistrationURL)
      cardDetails = utils.stringifyRequestData(cardDetails || {})

      // prepare outside HTTP call
      var req = https.request({
        host: url.host,
        port: url.port,
        path: url.path,
        method: 'POST'
      })

      var curl = "curl"
      curl += " -X POST"
      curl += " 'https://"+url['host']+url.path+"'"
      curl += " -d '"+cardDetails+"'"
      console.log(curl)

      req.on('response', function(res){
        var body = ''
        res.setEncoding('utf8')
        res.on('data', function(chunk){ body += chunk })
        res.on('end', function(){

          body = qs.parse(body)

          if(body.errorCode)
            return next.call(self, error(body.errorCode))

          self.completeRegistration.call(self, {
            Id: cardRegistration.Id,
            RegistrationData: qs.stringify(body) // data=hashkey
          }, next)

        })
      })

      req.on('error', function(err){
        next.call(self, err, null)
      })

      req.on('socket', function(socket){
        socket.on('secureConnect', function(){
          req.write(cardDetails)
          req.end()
        })
      })

    },

    completeRegistration: httpMethod({
      method: 'POST',
      path: '{Id}',
      params: {
          'Id': { required: true }
        , 'RegistrationData': { required: true }
      }
    })

  }

})
