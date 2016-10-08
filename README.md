# ionic-chat
a chat app based on ionic and rongyun


### file structure
   ```
   ProjectName/
    ├── hooks/
    ├── node_modules/  
    ├── platforms/ 
    ├── plugins/ 
    ├── scss
    │   ├── ionic.app.scss
    │   └── ...
    ├── www
    │   ├── dist/
    │   │    ├── js/
    │   │    │    ├── dash.min.js
    │   │    │    ├── account.min.js
    │   │    │    ├── chat.min.js
    │   │    │    └── ... 
    │   │    └── css/
    │   │    │    ├── dash.css
    │   │    │    ├── account.css
    │   │    │    ├── chat.css
    │   │    │    └── ... 
    │   ├── app/
    │   ├── common/
    │   ├── lib/
    │   ├── account/ 
    │   │    ├── business/ 
    │   │    ├── css/
    │   │    ├── js/
    │   │    └── tpl/
    │   ├── chat/
    │   │    ├── business/ 
    │   │    ├── css/
    │   │    ├── js/
    │   │    └── tpl/
    │   ├── dash
    │   │    ├── business/ 
    │   │    ├── css/
    │   │    ├── js/
    │   │    └── tpl/
    │   ├── autoupdate.js 
    │   ├── bootstrap.js 
    │   ├── index.html
    │   ├── service-worker.js
    │   └── manifest.json 
    ├── config.xml
    ├── ionic.project
    ├── package.json
    ├── gulpfile.js
    ├── bower.json
    ├── .bowerrc
    ├── .editorconfig
    ├── .gitignore
    ├── README.md
    └── LICENSE
   ```

### server tech
1. node with express
2. mongodb with mongoloose

### how to run
1. install node
2. set up the enviroment for android/ios
3. install ionic. please follow the instrunction on [ionicframework](http://ionicframework.com/getting-started/)
4. git clone https://github.com/pengkobe/ionic-chat.git
5. cd /path/to/ionic-chat
6. ionic platform add android/ios
7. ionic build  android/ios
8. ionic emulate  android/ios


### how to debug on web browser
+ userindex.js
```
//initRong.init(user.rongyunToken);
```
  
+ contacts
```
 //init();
 initTest();
```
    
+ chatDetail
```
 //path = cordova.file.documentsDirectory;
 //path = cordova.file.externalApplicationStorageDirectory;
 //init();
```
  
+ just run ionic serve under ionic-chat dir
```
ionic serve 
```

### todo
1. localstorage policy
2. file transfer
3. group vedio chat
4. red packets
5. task
4. make it beautiful and stable

### licence
MIT
