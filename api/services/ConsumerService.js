'use strict';

var unirest = require("unirest")
var async= require('async')


var ConsumerService = {

    create: function (inc, cb) {

        var consumer = {}
        unirest.post(sails.config.kong_admin_url + '/consumers')
            .header('Content-Type', 'application/json')
            .send({
                username  : inc.username,
                custom_id : inc.custom_id
            })
            .end(function (response) {
                if (response.error)  {
                    if(response.body) {
                        response.body.path = "consumer"
                        response.body.obj = {
                            username  : inc.username,
                            custom_id : inc.custom_id
                        }
                    }

                    return cb(response)
                }

                consumer = response.body

                ConsumerService
                    .addAcls(consumer.id,inc.acls,function(err,result){
                        if(err) {
                            // Try to delete the created consumer in case of error
                            KongaApiService
                                .consumers
                                .delete(consumer.id,function(error,ok){})
                            return cb(err)
                        }
                        consumer.acls = result

                        ConsumerService
                            .addAuthorizations(consumer.id,inc.authorizations,function(err,auths){
                                if(err) {
                                    // Try to delete the created consumer in case of error
                                    KongaApiService
                                        .consumers
                                        .delete(consumer.id,function(error,ok){})
                                    return cb(err)
                                }
                                consumer.autorizations = auths
                                return cb(null,consumer)
                            })
                    })
            })
    },

    update : function(consumer_id,consumer,cb) {
        unirest.patch(sails.config.kong_admin_url + '/consumers/' + consumer_id)
            .header('Content-Type', 'application/json')
            .send(consumer)
            .end(function (response) {
                if (response.error) return cb(response)
                return cb(null,response.body)
            })
    },

    delete : function(consumer_id,cb) {
        unirest.delete(sails.config.kong_admin_url + '/consumers/' + consumer_id)
            .header('Content-Type', 'application/json')
            .end(function (response) {
                if (response.error) return cb(response)
                return cb(null,response.body)
            })
    },

    addAcls: function (consumer_id,acls, cb) {
        if(!acls || !acls.length) return cb(null,{})

        var promises = []

        acls.forEach(function(acl) {
            promises.push(function (callback) {
                unirest.post(sails.config.kong_admin_url + '/consumers/' + consumer_id + "/acls")
                    .header('Content-Type', 'application/json')
                    .send({
                        group : acl
                    })
                    .end(function(response){
                        if(response.error) {
                            if(response.body) {
                                response.body.path = "acls"
                                response.body.obj = acl
                            }

                            return callback(response);
                        }
                        return callback(null,response.body)
                    })
            })
        })

        async.series(promises, function(err,result) {
            if (err) return cb(err)
            return cb(null,result)
        });


    },

    addAuthorizations: function (consumer_id,authorizations, cb) {
        if(!authorizations || !authorizations.length) return cb(null,{})
        var promises = []
        var _authorizations = {}

        authorizations.forEach(function(auth) {
            promises.push(function (callback) {
                unirest.post(sails.config.kong_admin_url + '/consumers/' + consumer_id + "/" + auth.name)
                    .header('Content-Type', 'application/json')
                    .send(auth.config || {})
                    .end(function (response) {

                        if (response.error) {
                            if(response.body) {
                                response.body.path = "authorizations"
                                response.body.obj = auth
                            }

                            return callback(response)
                        }

                        if(!_authorizations[auth.name]) _authorizations[auth.name] = []
                        _authorizations[auth.name].push(response.body)

                        return callback(null, response.body)
                    })
            })
        })

        async.series(promises, function(err,result) {
            if (err) return cb(err)
            return cb(null,_authorizations)
        });
    },

    listCredentials : function(consumer_id,cb) {

        var credentials = ['jwt','key-auth']
        var promises = []

        credentials.forEach(function(credential){
            promises.push(function(cb) {
                unirest.get(sails.config.kong_admin_url + '/consumers/' + consumer_id + "/" + credential)
                    .header('Content-Type', 'application/json')
                    .end(function(response){
                        if(response.error) return  cb({
                            status : response.error.status,
                            message : response.body
                        })
                        return cb(null,{
                            name : credential,
                            data : response.body.data,
                            total : response.body.total
                        })
                    })
            })
        })

        async.series(promises, function(err,result) {
            if (err) return cb(err)

            var obj = {
                credentials : []
            }
            var sum_total = 0
            result.forEach(function(result){
                sum_total = sum_total + result.total
                if(result.total > 0) obj.credentials.push(result)
            })

            obj.total = sum_total

            return cb(null,obj)
        });

    },
}

module.exports = ConsumerService
