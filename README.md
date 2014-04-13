openshift-diy-nodejs-mongodb
============================

Thanks for the great work by [razorinc](https://github.com/razorinc/redis-openshift-example) and [creationix](https://github.com/creationix/nvm/), this repo let you test Node.js v0.8 and above with MongoDB in an OpenShift DIY application. It will first check for pre-compiled Node.js linux version, then compile from source if not found.

[node-supervisor](https://github.com/isaacs/node-supervisor) is used to automatically restart the node.js app if somehow crashed.

- **Note that Node.js `v0.6.x` won't work with this method.**
- **This repo is for technology preview/testing purpose only, not good for production**
- **MongoDB server is setup for standalone environment only**
- **NO authentication is setup when connect to MongoDB server**
- **MongoDB Journal is disabled to save disk space**
- **MongoDB binary alone use up around 240MB, better limit your test database size under 500MB**

Usage - New (rhc-1.4.7 or above)
--------------------------------
Create the DIY app

    rhc app create yourapp diy-0.1 --from-code=git://github.com/eddie168/openshift-diy-nodejs-mongodb.git

**Note that using `--from-code` will not retain this repository as `remote` in your app's repo, so you will have to manually merge any future updates if you interested.**

Usage - Old
-----------

Create an DIY app

    rhc app create -t diy-0.1 -a yourapp

Add this repository

    cd yourapp
    git remote add nodejsMongo -m master git://github.com/eddie168/openshift-diy-nodejs-mongodb.git
    git pull -s recursive -X theirs nodejsMongo master

Change settings in `config_diy.json` if needed (remember to commit the changes), then push the repo to openshift

    git push

If pre-compiled Node.js binary is not available, first push will take a while to finish.

You can specify the Node.js script to start with in `package.json` as described [here](https://openshift.redhat.com/community/kb/kb-e1048-how-can-i-run-my-own-nodejs-script).

Check the end of the `git push` message for Node.js and MongoDB version:

    remote: Starting DIY cart
    remote: Node Version:
    remote: { http_parser: '1.0',
    remote:   node: '0.10.10',
    remote:   v8: '3.14.5.9',
    remote:   ares: '1.9.0-DEV',
    remote:   uv: '0.10.10',
    remote:   zlib: '1.2.3',
    remote:   modules: '11',
    remote:   openssl: '1.0.1e' }
    remote: MongoDB Version:
    remote: db version v2.4.4
	remote: Thu Jun 13 04:15:26.653 git version: xxxxxxxxxxxxxxxx
	remote: note: noprealloc may hurt performance in many applications
	remote: about to fork child process, waiting until server is ready for connections.
	remote: forked process: xxxx
	remote: all output going to: /var/lib/openshift/xxxxxxxxxx/diy/logs/mongodb.log
	remote: child process started successfully, parent exiting
	remote: nohup supervisor -w . -i node_modules server.js >/var/lib/openshift/xxxxxxxx/diy//logs/server.log 2>/var/lib/openshift/xxxxxxxx/diy//logs/error.log &

In this case it is Node.js `v0.10.10` and MongoDB `v2.4.4`.

You can find the Node.js app's log at `$OPENSHIFT_LOG_DIR/server.log`. Subsequent push or restart will rename the log file with a time stamp before overwritten. The same goes to MongoDB log file and can be found at `$OPENSHIFT_LOG_DIR/mongodb.log`. You should be able to see these log files with `rhc tail -a yourapp`.

Check the log file for the MongoDB test output in the example `server.js`.

Settings
--------

Edit `config_diy.json`

    "nodejs": {
      "version": "v0.10.26",
      "removeOld": true,
      "separateErrorLog": true,
      "cleanNPMInstall": false
    },
    "mongodb": {
      "version": "2.6.0",
      "port": 27017,
      "removeOld": true
    }

- `nodejs.version`: change node.js version
- `nodejs.removeOld`: delete previous installed node.js binarys
- `nodejs.separateErrorLog`: If `true`, error will be redirected to `${OPENSHIFT_DIY_LOG_DIR}/error.log`, otherwise will be redirected into `${OPENSHIFT_DIY_LOG_DIR}/server.log`
- `cleanNPMInstall`: If `true`, the `node_modules/` directory will be deleted before execute `npm install`. Set it to `false` to reduce the time required to re-deploy (especially when there are native code modules such as `bcrypt`).

- `mongodb.version`: change MongoDB version
- `mongodb.port`: port used by MongoDB (Refer to port number limit [here](https://openshift.redhat.com/community/kb/kb-e1038-i-cant-bind-to-a-port))
- `mongodb.removeOld`: delete previous installed MongoDB binary

After change settings, `commit` and then `push` to reflect the changes to your OpenShift gear.


Use MongoDB in Node.js
----------------------

Environment variables `MONGODB_URL` (which is based on `$OPENSHIFT_DIY_IP` when the app is started) is defined. Example of connecting to MongoDB server using the Node.js native driver:

	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect(process.env.MONGODB_URL + "testDB", function(err, db) {
  	  if (err) { return console.dir(err); }
  	});


