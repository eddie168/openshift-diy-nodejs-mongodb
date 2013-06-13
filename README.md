openshift-diy-nodejs08
========================

Thanks for the great work by [razorinc](https://github.com/razorinc/redis-openshift-example) and [creationix](https://github.com/creationix/nvm/), this repo let you test node.js v0.8 (v0.9 seems OK too) with OpenShift DIY application type. It will first check for pre-compiled linux version, then compile from source if not found.

[node-supervisor](https://github.com/isaacs/node-supervisor) is used to automatically restart the node.js app if somehow crashed.

Usage - New (rhc-1.4.7 or above)
--------------------------------
Create the DIY app

    rhc app create yourapp diy-0.1 --from-code=git://github.com/eddie168/openshift-diy-nodejs08.git

Check for node version:

    rhc tail -a test
    Password: **

    ==> diy-0.1/logs/error.log <==
    DEBUG: Running node-supervisor with
    DEBUG:   program 'server.js'
    DEBUG:   --watch '.'
    DEBUG:   --ignore 'node_modules'
    DEBUG:   --extensions 'node|js'
    DEBUG:   --exec 'node'
    DEBUG: Starting child process with 'node server.js'
    DEBUG: Ignoring directory '/var/lib/openshift/xxxxxxxxxxxxxxxxxx/app-root/runtime/repo/node_modules'.
    DEBUG: Watching directory '/var/lib/openshift/xxxxxxxxxxxxxxxxxx/app-root/runtime/repo' for changes.
    
    ==> diy-0.1/logs/server.log <==
    
    
    Tue Feb 19 2013 02:57:32 GMT-0500 (EST): Node (version: v0.8.20) /var/lib/openshift/xxxxxxxxxxxxxxxxxx/app-root/runtime/repo/server.js started on xxx.xxx.xxx.xxx:8080 ...

In this case it is node `v0.8.20`.

**Note that using `--from-code` will not retain this repository as `remote` in your app's repo, so you will have to manually merge any future updates if you interested.**

Usage - Old
-----------

Create an DIY app

    rhc app create -t diy-0.1 -a yourapp

Add this repository

    cd yourapp
    git remote add nodejs08 -m master git://github.com/eddie168/openshift-diy-nodejs08.git
    git pull -s recursive -X theirs nodejs08 master

Then push the repo to openshift

    git push

If pre-compiled binary is not available, first push will take a while to finish.

You can specify the node.js script to start with in `package.json` as described [here](https://openshift.redhat.com/community/kb/kb-e1048-how-can-i-run-my-own-nodejs-script).

Check the end of the message for node version:

    remote: Starting application...
    remote: Node Version:
    remote: { http_parser: '1.0',
    remote:   node: '0.8.20',
    remote:   v8: '3.11.10.25',
    remote:   ares: '1.7.5-DEV',
    remote:   uv: '0.8',
    remote:   zlib: '1.2.3',
    remote:   openssl: '1.0.0f' }
    remote: nohup supervisor server.js >/var/lib/openshift/xxxxxxxxxxxxxxxxxx/diy-0.1/logs/server.log 2>&1 &
    remote: Done

In this case it is node `v0.8.20`.

Now open your openshift app in browser and you should see the standard openshift sample page. Enjoy!!

Settings
--------

Edit `config_diy.json`

    "nodejs": {
      "version": "v0.8.20",
      "removeOld": false,
      "separateErrorLog": true,
      "storeModulesInData": true,
      "cleanModulesInData": false
    }

- `version`: change node.js version
- `removeOld`: delete previous installed node.js binarys
- `separateErrorLog`: If `true`, error will be redirected to `${OPENSHIFT_DIY_LOG_DIR}/error.log`, otherwise will be redirected into `${OPENSHIFT_DIY_LOG_DIR}/server.log`
- `storeModulesInData`: Every deploy (`git push`) the entire repo got refreshed which mean all modules/packages will need to re-install again. Set `storeModulesInData` to `true` so that modules/packages are installed under `$OPENSHIFT_DATA_DIR`, as a result the time required to re-deploy can be reduced (especially when there are native code modules such as `bcrypt`).
- `cleanModulesInData`: If somehow you want to do a fresh install of the modules, set this option to `true`. Remember to set it back to `false` before the next deploy or everything will re-install again.

`commit` and then `push` to reflect the changes to the OpenShift app.

**Note that `v0.6.x` won't work with this method.**

