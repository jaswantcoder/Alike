var Queue = require('firebase-queue');
var firebase = require('firebase-admin');

firebase.initializeApp({
  credential: firebase.credential.cert("./serviceAccountKey.json"),
  databaseURL: "https://alike-ed1bd.firebaseio.com"
});

var db = firebase.database();
var queueRef = db.ref('queue');
var tasksRef = db.ref('queue/tasks');

tasksRef.push({'_state':'start_wait'});

var options = {
  'specId': 'wait_for_users',
  'numWorkers' : 1
};

var waitForUsers = new Queue(queueRef, options, function(data, progress, resolve, reject) {
  console.log("Here");
  setTimeout(function() {
    console.log("In waitForUsers");
    var uidRef = db.ref('uid');
    if(uidRef == null){
      resolve(data);
      tasksRef.push({'_state':'start_wait'});
      console.log("task resolved");      
    }else{
      uidRef.once("value", function(snapshot) {
        console.log("Data Retrieved");
        var uidTable = snapshot.val();
        if(uidTable == null || typeof uidTable == undefined){
          tasksRef.push({'_state':'start_wait'});
          resolve(data);
        }else{
          var num_online = Object.keys(uidTable).length; 
          console.log(num_online);
          if(num_online > 0){
            uidTable['_state'] = 'match_start';
            tasksRef.push(uidTable);
          }
          resolve(data);
          console.log("task resolved");  
        }            
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        tasksRef.push({'_state':'start_wait'});
        resolve(data);
      });
    }
  }, 5000);  
});



process.on('SIGINT', function() {
  console.log('Starting queue shutdown');
  waitForUsers.shutdown().then(function() {
    console.log('Finished queue shutdown');
    process.exit(0);
  });
});