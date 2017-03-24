'use strict';

/**
 * This hook registers the API to Kong
 * @type {ApiService|exports|module.exports}
 */

//var ApiService = require('../services/ApiService')
//var ip = require('ip');

module.exports = function hook(sails) {
  return {

    process: function process(next) {

      //var api = {
      //  "name" : "kong-admin-proxy",
      //  "request_path" : "/kong-proxy",
      //  "strip_request_path" : true,
      //  "preserve_host" : true,
      //  "upstream_url" : "http://" + ( process.env.KONG_ADMIN_PROXY_HOST || ip.address() ) + ":" + sails.config.port,
      //  "plugins" : [{
      //    "name" : "key-auth"
      //  }]
      //}
      //
      //
      //ApiService.register(api,function(err,done){
      //  if(err) return sails.log.warn(">> Failed to register API",err.body)
      //  return sails.log.debug(">> API registered successfully!")
      //})

      next()


    },

    /**
     * Method that runs automatically when the hook initializes itself.
     *
     * @param {Function}  next  Callback function to call after all is done
     */
    initialize: function initialize(next) {
      var self = this;

      // Wait for sails orm hook to be loaded
      sails.after('hook:orm:loaded', function onAfter() {
        self.process(next);
      });
    }
  };
};
