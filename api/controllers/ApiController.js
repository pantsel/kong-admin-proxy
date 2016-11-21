/**
 * ApiControllerController
 *
 * @description :: Server-side logic for managing Apicontrollers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var ConsumerService = require('../services/ConsumerService')
var ApiService = require('../services/ApiService')

module.exports = {


    /**
     * Proxy requests to native Kong Admin API
     * @param req
     * @param res
     */
    proxy : function(req,res) {
        global.$proxy.web(req, res, {
            target: sails.config.kong_admin_url
        });
    },

    /**
     * List all credentials assigned to the specified consumer
     * @param req
     * @param res
     */
    listConsumerCredentials : function(req,res) {

        ConsumerService.listCredentials(req.params.id,function(err,result){
            if(err) return res.negotiate(err)
            return res.json(result)
        })
    },

    /**
     * Creates a consumer and with associated groups and authorizations
     * @param req
     * @param res
     */
    createConsumer : function(req,res) {
        ConsumerService.create(req.body,function(err,response){
            if(err) return res.send(err.statusCode,err.body)
            return res.json(response)
        })
    },


    /**
     * Registers or updates an already registered api and it's associated plugins
     * @param req
     * @param res
     */
    registerApi : function(req,res) {
        ApiService.register(req.body,function(err,response){
            if(err) return res.send(err.statusCode,err.body)
            return res.json(response)
        })
    }
};

