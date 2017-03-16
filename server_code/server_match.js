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
var likesRef = db.ref('likes');

var options = {
  'specId': 'find_match',
  'numWorkers' : 5,
  'sanitize': false,
  'suppressStack': true
};

var matchQueue = new Queue(queueRef, options, function(data, progress, resolve, reject) {
  console.log("In match Queue");
  // var uidList = [];
  // var keyList = [];
  // for(key in data){
  //   if(data.hasOwnProperty(key)){
  //     if(data[key]['uid']!=null && typeof data[key]['uid']!=undefined){
  //       uidList.push(data[key]['uid']);
  //       keyList.push(key);
  //     }
  //   }
  // }
  // len = keyList.length;
  // console.log(len);
  // if(len%2 == 0){
  //   for(var i=0;i<len;i+=2){
  //     if(typeof uidRef.child(keyList[i])['match'] == undefined || uidRef.child(keyList[i])['match'] == null){
  //       uidRef.child(keyList[i]).update({match:uidList[i]+uidList[i+1]});
  //       uidRef.child(keyList[i+1]).update({match:uidList[i]+uidList[i+1]});
  //     }
  //   }
  // }
  // tasksRef.push({'_state':'start_wait'});
  // resolve(data);
  // 
  var keyList = {};
  var index = 0;
  for(key in data){
    // console.log(data[key]);
    // console.log(data[key]['uid']);
    if(data[key]['uid']!=null && data[key]['uid']!=undefined){
      // console.log(data[key]['match'] );
      // console.log(data[key]['uid']);
      if(data[key]['match'] == null || data[key]['match'] === undefined){
        // console.log("not null");
        var keyList_entry = {};
        keyList_entry['uid'] = data[key]['uid']; 
        keyList_entry['orig'] = key;
        keyList[index] = keyList_entry;
        index += 1;
      }
    }
  }
  console.log("KeyList");
  console.log(keyList);
  len = Object.keys(keyList).length;
  console.log(len);
  // if(len%2!=0){
  //   tasksRef.push({'_state':'start_wait'});    
  //   resolve(data);
  // }else{
    likesRef.once("value", function(snapshot) {
      var likesTable = snapshot.val();
      var matched = 0;
      for(var i = 0;i<len;i++){
        var selfid = keyList[i]['uid'];
        console.log(keyList[i]);
        console.log(likesTable);
        console.log(selfid);
        if(likesTable[selfid] != undefined && likesTable[selfid] != null){
          keyList[i]['ratings'] = likesTable[selfid];
          keyList[i]['match'] = {};
        }else{
          console.log("In change");
          keyList[i]['ratings'] = {};
          keyList[i]['match'] = {};
        }
      }
      console.log("After rating");
      console.log(keyList);
      for(var i=0;i<len;i++){
        if(len%2 == 1 && matched == len-1)  break;
        if(Object.keys(keyList[i]['match']).length == 0){
          if(Object.keys(keyList[i]['ratings']).length == 0){
            console.log("Null rating");
            var j = i+1;
            console.log(keyList);
            console.log(j);
            while(Object.keys(keyList[i]['match']).length != 0){
              j += 1;
              if(j>=len)
                break;
            }
            console.log(j);
            console.log(len);

            if(j<len){
              uidRef.child(keyList[i]['orig']).update({match:keyList[i]['uid']+keyList[j]['uid']});
              uidRef.child(keyList[j]['orig']).update({match:keyList[i]['uid']+keyList[j]['uid']});
              keyList[i]['match'] = "done";
              keyList[j]['match'] = "done";
              matched += 2;
            }
          }else{
            var max_match={};
            max_match['num'] = -Infinity;
            var j;
            for(j=i+1;j<len;j++){
              if(len%2 == 1 && matched == len-1){
                tasksRef.push({'_state':'start_wait'});
                resolve(data);
                return;
              }
              if(Object.keys(keyList[i]['match']).length == 0){
                var match;
                if(keyList[i]['ratings'][keyList[j]['uid']] === undefined){
                  match = 0;
                }else{
                  match = keyList[i]['ratings'][keyList[j]['uid']]['rate']/keyList[i]['ratings'][keyList[j]['uid']]['total_chat'];
                }
                console.log(match);
                console.log("======");
                console.log(keyList);
                for(partner in keyList[i]['ratings']){
                  if(keyList[j]['ratings'][partner] != undefined && keyList[j]['ratings'][partner]!=null){
                    console.log("--------------");
                    console.log(keyList[j]['ratings'][partner]['rate']/keyList[j]['ratings'][partner]['total_chat']);
                    console.log(keyList[i]['ratings'][partner]['rate']/keyList[i]['ratings'][partner]['total_chat']);
                    console.log(typeof keyList[i]['ratings'][partner]['rate']);
                    console.log(typeof keyList[i]['ratings'][partner]['total_chat']);
                    match += (keyList[j]['ratings'][partner]['rate']/keyList[j]['ratings'][partner]['total_chat'])*
                      (keyList[i]['ratings'][partner]['rate']/keyList[i]['ratings'][partner]['total_chat']);
                    console.log(match);
                  }
                }
                console.log("Before Compare");
                console.log(keyList[i]['uid'] + " : " + keyList[j]['uid']);
                console.log(match);
                if(max_match['num']<=match){
                  max_match['num'] = match;
                  max_match['match_index'] = j;
                }
                console.log("After compare");
                console.log(max_match['num']);
              }
            }
            j = max_match['match_index'];
            console.log(max_match['num']);
            console.log(keyList);
            console.log(i);
            console.log(j);
            uidRef.child(keyList[i]['orig']).update({match:keyList[i]['uid']+keyList[j]['uid']});
            uidRef.child(keyList[j]['orig']).update({match:keyList[i]['uid']+keyList[j]['uid']});
            keyList[i]['match'] = "done";
            keyList[j]['match'] = "done";
            matched += 2;
          }
        }
      }  
      tasksRef.push({'_state':'start_wait'});
      resolve(data);
    },function(errorObject){
      console.log("The read failed: " + errorObject.code);
      resolve(data);
    });

  // if(len%2 == 0){
  //   for(var i=0;i<len;i+=2){
  //     if(typeof uidRef.child(keyList[i])['match'] == undefined || uidRef.child(keyList[i])['match'] == null){
  //       uidRef.child(keyList[i]).update({match:uidList[i]+uidList[i+1]});
  //       uidRef.child(keyList[i+1]).update({match:uidList[i]+uidList[i+1]});
  //     }
  //   }
  // }
  
});

process.on('SIGINT', function() {
  console.log('Starting queue shutdown');
  matchQueue.shutdown().then(function() {
    console.log('Finished queue shutdown');
    process.exit(0);
  });
});