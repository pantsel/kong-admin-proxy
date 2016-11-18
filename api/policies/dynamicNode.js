'use strict';

/**
 * Policy to set necessary update data to body. Note that this policy will also remove some body items.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function dynamicNode(request, response, next) {
  sails.log.debug(' [Policy.dynamicNode() called]');

  sails.config.kong_admin_url = request.headers['kong-admin-url'] || sails.config.kong_admin_url
  return  next()

};
