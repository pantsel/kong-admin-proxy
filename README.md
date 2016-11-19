# kong-admin-proxy [![Build Status](https://travis-ci.org/pantsel/kong-admin-proxy.svg?branch=master)]

A web proxy microservice that proxies requests to the native Kong's Admin API, while extending it by providing helpful methods for integration.

## Summary

- [**Prerequisites**](#prerequisites)
- [**Installation**](#installation)
- [**Configuration**](#configuration)
- [**Usage**](#usage)
- [**License**](#license)

## Prerequisites
- A running [Kong installation](https://getkong.org/) 
- Nodejs
- Npm
- [Sailsjs](http://sailsjs.org/) 

## Installation

Install <code>npm</code> and <code>node.js</code> and <code>sails</code>. Instructions can be found [here](http://sailsjs.org/#/getStarted?q=what-os-do-i-need).

### With npm
<pre>
# Install
npm install -g kong-admin-proxy

# Start service
kong-admin-proxy start

# To start kong-admin-proxy on a custom port
kong-admin-proxy start -p [port]
</pre>

### From source
<pre>
$ git clone https://github.com/pantsel/kong-admin-proxy.git
$ cd kong-admin-proxy
$ npm install
$ npm start
</pre>

## Configuration
There is an example configuration file on following path.

<pre>
/config/local_example.js
</pre>

Just copy this to <code>/config/local.js</code> and make necessary changes to it. Note that this
<code>local.js</code> file is in .gitignore so it won't go to VCS at any point.

## Usage

> kong-admin-proxy proxies requests to all Kong's admin routes

The microservice registers itself to Kong and can be accessed like:

<pre>
$ curl -X (GET,POST,PATCH,PUT,DELETE) http://kong:8000/kong-proxy/{any-kong-admin-api-route}
</pre>

##### Request Headers


<table>
    <tr>
        <th>Header</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>apikey</code> (required)</td>
        <td>-</td>
        <td><small>The <code>key-auth</code> credential assigned to a registered consumer.</small></td>
    </tr>
    <tr>
        <td><code>kong-admin-url</code> (optional)</td>
        <td><small>The <code>kong_admin_url</code> specified in <code>/config/local.js</code> configuration.</small></td>
        <td><small>The URL of Kong's admin API.</small></td>
    </tr>
</table>

## Extended methods

### Create Consumer <code>POST</code>

> $ curl -X POST http://kong:8000/kong-proxy/consumers

Create a consumer while associating it with groups and authorizations all at once.

##### Request Body

<table>
    <tr>
        <th>Attribute</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>username</code> (semi-optional)</td>
        <td><small>The consumer's <code>username</code>.</small></td>
    </tr>
    <tr>
        <td><code>custom_id</code> (semi-optional)</td>
        <td><small>The consumer's <code>custom_id</code>.</small></td>
    </tr>
    <tr>
        <td><code>acls</code> (optional)</td>
        <td><small>An array of group names to assign to the consumer.</small></td>
    </tr>
    <tr>
            <td><code>authorizations</code> (optional)</td>
            <td><small>An array of Authorization credentials to assign to the consumer.</small></td>
        </tr>
</table>

##### Example
<pre>
{
    "username"  : "testio",
    "custom_id" : "qwerty",
    "acls" : ["group1","group2","group3"],
    "authorizations" : [{
        "name" : "basic-auth",
        "config" : {
            "username" : "testio",
            "password" : "secret"
        }
    },{
        "name" : "hmac-auth",
        "config" : {
            "username" : "testio",
            "secret" : "secret"
        }
    },{
        "name" : "jwt" // Default configuration will be used
    },{
        "name" : "key-auth" // Default configuration will be used
    },{
        "name" : "oauth2",
        "config" : {
            "name" : "testio",
            "redirect_uri" : "http://testio.com/authorize"
        }	
    }]
}
</pre>

### Register API <code>POST</code>

#### $ curl -X POST http://kong:8000/kong-proxy/apis

Register an API while adding required plugins to it as well.

> You can also update an already registered API and it's associated plugins by including the API's <code>id</code> property to the request.


#####Request Body

<table><thead>
<tr>
<th style="text-align: right">Attribute</th>
<th>Description</th>
</tr>
</thead><tbody>
<tr>
<td style="text-align: right"><code>name</code><br><em>optional</em></td>
<td>The API name. If none is specified, will default to the <code>request_host</code> or <code>request_path</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>request_host</code><br><em>semi-optional</em></td>
<td>The public DNS address that points to your API. For example, <code>mockbin.com</code>. At least <code>request_host</code> or <code>request_path</code> or both should be specified.</td>
</tr>
<tr>
<td style="text-align: right"><code>request_path</code><br><em>semi-optional</em></td>
<td>The public path that points to your API. For example, <code>/someservice</code>. At least <code>request_host</code> or <code>request_path</code> or both should be specified.</td>
</tr>
<tr>
<td style="text-align: right"><code>strip_request_path</code><br><em>optional</em></td>
<td>Strip the <code>request_path</code> value before proxying the request to the final API. For example a request made to <code>/someservice/hello</code> will be resolved to <code>upstream_url/hello</code>. By default is <code>false</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>preserve_host</code><br><em>optional</em></td>
<td>Preserves the original <code>Host</code> header sent by the client, instead of replacing it with the hostname of the <code>upstream_url</code>. By default is <code>false</code>.</td>
</tr>
<tr>
<td style="text-align: right"><code>upstream_url</code></td>
<td>The base target URL that points to your API server, this URL will be used for proxying requests. For example, <code>https://mockbin.com</code>.</td>
</tr>
<td style="text-align: right"><code>plugins</code></td>
<td>An array of plugin configurations to add to the API.</td>
</tr>
</tbody></table>

##### Example

<pre>
{
	"name" : "testapi",
	"request_path" : "/testapi",
	"strip_request_path" : true,
	"preserve_host" : false,
	"upstream_url" : "http://testapi.io",
	"plugins" : [{
		"name" : "hmac-auth",
		"config.hide_credentials" :false
	},{
		"name" : "acl",
		"config.blacklist" : "192.168.1.2,192.168.1.3"
		
	},{
		"name" : "jwt" // Default configuration will be used
	}]
	
}
</pre>

### Retrieve consumer credentials <code>GET</code>

#### $ curl -X GET http://kong:8000/kong-proxy/consumers/{id or username}/credentials

Retrieve all credentials assigned to the specified consumer

##### Example response

<pre>
HTTP 200 OK

{
  "credentials": [
    {
      "name": "jwt",
      "data": [
        {
          "secret": "5e107841ab65444b936c45013723c377",
          "id": "6c5431ca-b311-4111-aea4-b4d57a61d5c4",
          "created_at": 1479414037000,
          "key": "87aacc4f613447ed9f8bcec05f787a34",
          "algorithm": "HS256",
          "consumer_id": "8c669088-796b-46f2-aaa5-f403760811f0"
        }
      ],
      "total": 1
    },
    {
      "name": "key-auth",
      "data": [
        {
          "created_at": 1479327062000,
          "consumer_id": "8c669088-796b-46f2-aaa5-f403760811f0",
          "key": "17cd7df14bc24dc385d7e40fdeb25714",
          "id": "a7e22f17-c738-4a53-b994-d2921255936e"
        }
      ],
      "total": 1
    },
    ...
  ],
  "total": 5
}
</pre>


## Author
Panagis Tselentis

## License
<pre>
The MIT License (MIT)
=====================

Copyright (c) 2015 Panagis Tselentis

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>
