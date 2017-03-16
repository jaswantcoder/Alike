var Queue = require('firebase-queue');
var firebase = require('firebase-admin');

firebase.initializeApp({
  credential: firebase.credential.cert("./serviceAccountKey.json"),
  databaseURL: "https://alike-ed1bd.firebaseio.com"
});

var db = firebase.database();
var queueRef = db.ref('queue');
var uidRef = db.ref('uid');
var tasksRef = db.ref('queue/tasks');

var options = {
  'specId': 'del_miss',
  'numWorkers' : 5,
  'sanitize': false,
  'suppressStack': true
};

var matchQueue = new Queue(queueRef, options, function(data, progress, resolve, reject) {
  console.log("Here");
  console.log(data['match']); 
  if(data['match']!="messages")
    db.ref(data['match']).remove();
  uidRef.once("value", function(snapshot) {
    console.log("Data Retrieved");
    var uidTable = snapshot.val();
    for(key in uidTable){
      if(uidTable.hasOwnProperty(key)){
        if(data['match'] == uidTable[key]['match']){
          uidRef.child(key).update({match:null});
        }
      }
    }
    resolve(data);
    console.log("task resolved");      
  }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
      resolve(data);
    });
});

process.on('SIGINT', function() {
  console.log('Starting queue shutdown');
  matchQueue.shutdown().then(function() {
    console.log('Finished queue shutdown');
    process.exit(0);
  });
});