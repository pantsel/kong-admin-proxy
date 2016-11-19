'use strict';

var unirest = require("unirest")
var async= require('async')


var ApiService = {

    register : function(api,cb) {

        var result = {}
        var plugins = []
        if(api.plugins) {
            plugins = api.plugins
            delete api.plugins
        }

        ApiService.updateOrAddApi(api,function(err,_api) {

            if (err)  return cb(err)

            if(!_api) {
                var error = new Error();
                error.message = 'Could not create an API with the requested properties.';
                error.customMessage = api;
                error.status = 400;
                return cb(error)
            }

            result = _api

            ApiService
                .updateOrAddPlugins(result.name,plugins,function(err,_plugins){
                    if (err)  {
                        if(err.statusCode !== 409)
                            KongaApiService.apis.deleteApi(result.id,function(err,deleted){})
                        return cb(err)
                    }
                    result.plugins = _plugins
                    return cb(null,result)

                })
        })
    },
    updateOrAddApi : function(api,cb) {

        // Try to find the API
        unirest.get(sails.config.kong_admin_url + "/apis/" + api.id)
            .end(function (response) {
                if (response.error)  {
                    if(response.statusCode === 404) {
                        // API not found we need to create it
                        ApiService.createApi(api,function(err,api){
                            if(err) return cb(err)
                            return cb(null,api)
                        })
                    }else{
                        return cb(response)
                    }
                }else{
                    // Api found, we need to update it
                    var api_id = api.id
                    delete api.id
                    ApiService.updateApi(api_id,api,function(err,api){
                        if(err) return cb(err)
                        return cb(null,api)
                    })
                }
            })
    },

    createApi : function(api,cb) {
        unirest.post(sails.config.kong_admin_url + "/apis")
            .send(api)
            .end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },
    updateApi : function(api_id,api,cb) {

        unirest.patch(sails.config.kong_admin_url + "/apis/" + api_id)
            .send(api)
            .end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,response.body)
            })
    },

    deleteApi : function(api_id,cb) {
        unirest.delete(sails.config.kong_admin_url + "/apis/" + api_id)
            .end(function (response) {
                if (response.error)  return cb(response)
                return cb(null,true)
            })
    },

    updateOrAddPlugins : function(api,plugins,cb) {
        if(!plugins || !plugins.length) return cb(null,{})
        var promises = []

        plugins.forEach(function(plugin) {
            promises.push(function (callback) {


                unirest.put(sails.config.kong_admin_url + '/apis/' + api + "/plugins")
                    .send(plugin)
                    .end(function (response) {

                        if (response.error) {
                            return callback(response)
                        }

                        return callback(null, response.body)
                    })
            })
        })

        async.series(promises, function(err,result) {
            if (err) return cb(err)
            return cb(null,result)
        });
    }

}

module.exports = ApiService
