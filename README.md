# Microsoft Data Gathering
Microsoft Data Gathering offers organizations a fast, accurate, cost effective and
user-friendly way to collect data using mobile devices.

## Quick installation
### Ubuntu 14.04 LTS (amd64)
```
# sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
# echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
# sudo apt-get update
# sudo apt-get install nodejs mongodb-org librsvg2-bin
# wget -O /tmp/mdg.deb https://nokiadatagathering.net/binary/MDGServer_amd64.deb
# sudo dpkg -i /tmp/mdg.deb
# rm -f /tmp/mdg.deb
# cd /opt/MDGServer
# nano config.js # edit config to fit your needs
# start node-MDGServer
```

### Windows (x64)

1. Download and install [MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/). Make sure you configure it to run as system service.
1. Download and install [NodeJS](http://nodejs.org/download/)
1. Download [latest version of MDG](https://nokiadatagathering.net/binary/MDG.zip) and extract it to folder which contains no spaces (we assume ```C:\node\mdg``` for next steps)
1. If you are running Windows 8 - please enable .NET 3.5 support in components of your system
1. Edit ```C:\node\mdg\config.js``` to fit your needs
1. Grab [rsvg-convert binary](http://sourceforge.net/projects/tumagcc/files/rsvg-convert.exe/download) and put it to ```C:\node\mdg``` folder
1. Launch "Node.JS command prompt" as administrator
```
# cd C:\node\mdg
# node app --install

```

## Full installation (for development) on *nix
### Prerequirements
1. GIT (used both for retrieving MDG source and for installing some dependencies by NPM). For Ubuntu 14.04 LTS run
    ```
    # sudo apt-get install git
    ```
2. Node.js 0.10.x. For Ubuntu 14.04 LTS just run
    ```
    # sudo apt-get install nodejs
    ```
3. MongoDB. Please follow instructions on [MongoDB website](https://www.mongodb.org/downloads). __Attention: Ubuntu 14.04 ships with old (2.4) mongoDB in official repositories. Please use 10gen 
repository from link above to install mongoDB__
4. rsvg-convert binary (required for charts). Ubuntu users may run
    ```
    # sudo apt-get install librsvg2-bin
    ```
5. Build toolchain (compiler, etc.). Ubuntu users should run
    ```
    # sudo apt-get install build-essential
    ```
6. If your distribution names main nodeJS binary as "nodejs", not "node" you may experiece difficulties building some modules. Please run
    ```
    # sudo ln -s `which nodejs` /usr/bin/node
    ```

### Setting up project (development server)

First of all, let's install some global tools
```
# sudo npm install -g bower
# sudo npm install -g grunt-cli
```

Now clone the source and install project dependencies:
```
# git clone git://github.com/nokiadatagathering/MDGServer.git
# cd MDGServer
# npm install
# bower install
# grunt build
# grunt testing
```

```grunt testing``` should report about all tests passing. If it fails - check you have appropriate version of MongoDB running and all previous steps completed successfully

Now you are ready for test run.
```
# node app.js
Connected to MongoDB at mongodb://127.0.0.1:27017/MDG
Microsoft Data Gathering server listening on port 3000 in development mode
```
After that feel free to edit ```config.js``` to suit your needs. You can run production build (which serves minified js & css) with either
```
# NODE_ENV=production node app.js
```
or use ```npm start``` and ```npm stop``` to run in background

### Setting up project (production server)

At this point server is ready to run. But having compiler & other toolchains running on production server is considered as bad practice. So you can use your development server to create "release" build 
which could be deployed to any server with just node.js / mongodb dependency.

Before creating release make sure an architecture and glibc version you're running on development machine and server are identical. 

After that copy content of ```release``` folder to your production server.

__Please, take a note this build is NOT capable of running in development mode, so running it with ```node app.js``` will result in failing web interface__

It's up to you to decide how you bind default ports (like 80) to an app. You can setup such port in ```config.js```, but that will require root access for nodejs or setting required capability..

So, the only dependencies to run "release" version on server are
- nodejs 0.10.x
- mongodb
- rsvg-convert (provided by librsvg2-bin package in Ubuntu)

## Full installation (for development) on Windows
### Prerequirements

1. Download and install [MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/) and [NodeJS](http://nodejs.org/download/)
1. Download and install [GIT](http://msysgit.github.io/) 
1. Visual Studio (express version is fine). Do __NOT__ use VS express 2013 since it's missing some headers
1. Windows SDK for your OS. If you are running __Windows 8.1__ - please grab __Windows 8__ version instead

### Setting up project (development server)

First of all, let's install some global tools. Run "Node.JS command prompt"
```
# npm install -g bower
# npm install -g grunt
```

Now clone the source and install project dependencies:
```
# git clone git://github.com:nokiadatagathering/MDGServer.git
# cd MDGServer
# npm install
# bower install
# grunt build
# grunt testing
```

```grunt testing``` should report about all tests passing. If it fails - check you have appropriate version of MongoDB running and all previous steps completed successfully

If you have multiple installations of Visual Studion on your system, you may find that npm is picking wrong one, resulting in failed installation. In that case before install, you will require correct 
environment variables:
```
#"C:\Program Files (x86)\Microsoft Visual Studio 11.0\VC\bin\vcvars32.bat"
# npm install --msvs_version=2012
```

Now you are ready for test run.
```
# node app.js
Connected to MongoDB at mongodb://127.0.0.1:27017/MDG
Microsoft Data Gathering server listening on port 3000 in development mode
```
After that feel free to edit ```config.js``` to suit your needs. You can run production build (which serves minified js & css)
```
# NODE_ENV=production node app.js
```

### Setting up project (production server)

At this point server is ready to run. But having compiler & other toolchains running on production server is considered as bad practice. So you can use your development server to create "release" build 
which could be deployed to any server with just node.js / mongodb dependency.

/Before creating release make sure an architecture and glibc version you're running on development machine and server are identical. 

__Please, take a note this build is NOT capable of running in development mode, so running it with ```node app.js``` will result in failing web interface__

Please, take a note that ```rsvg-convert``` binary is not automatically copied to release folder due to license restrictions

### Installing as system service
Run following code in project folder:
```
# npm install -g node-windows
# npm link node-windows
# node app --install
```

You can use ```node app --uninstall``` to remove system service

## Submitting pull requests

In case you want to submit pull request to this repository, please check following:

+ new functionality or fixed bug is covered by test case
+ tests still run successfully
+ ```grunt codestyling``` reports no errors

