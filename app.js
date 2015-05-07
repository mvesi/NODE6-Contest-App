var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');


var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

// helper function to generate unique id for each submission
var uniqueId = (function(){
  var counter = 0;
  return function(prefix){
    return (prefix || '') + (counter++);
  };
})();

// declare submissions array that will hold submission objects
var submissions = [];
// var pairedSubmissions = []; - this can be activated if you just want to choose two video entries at random


app.get('/', function(req, res) {
	res.render('index', {
        submissions: submissions
      });
});



// Upon submitting entry, creates new object, adds it to submissions array, which is then used 
app.post('/submissions', function(req, res) {
    var embedUrl = '//www.youtube.com/embed/' + (req.body.url.split('v='))[1];
    console.log(embedUrl);
    var newSubmission = {
        id: uniqueId('submission_'),
        name: req.body.name,
        url: embedUrl,
        title: req.body.title,
        description: req.body.description,
        voteCounter: 0

    };

    // Add to list of submissions if there aren't more than 8 already
    if(submissions.length <= 7){
        submissions.push(newSubmission);
        // res.render('submissions', {
        //   submissions: submissions
        // });
        res.redirect('/');
        }
        else{
            res.render('maxmet');
            // Send the user back to the homepage
            // res.redirect('/')
        }

});

// renders submissions page if there are 8 submissions (otherwise returns you back to index)
app.get('/submissions', function(req, res){
    if(submissions.length === 8){
        res.render('submissions', {
        submissions: submissions
      });
    }
    else {
        res.redirect('/');
    }
});


app.get('/competing-submissions', function(req, res){
    // sorts the objects in the array by their voteCounter property (lowest to highest)
    var compare = function(a,b) {
      if (a.voteCounter < b.voteCounter)
         return -1;
      if (a.voteCounter > b.voteCounter)
        return 1;
      return 0;
    }

    submissions.sort(compare);
    console.log(submissions);

    // removes the half of the videos with the least # of votes
    submissions.splice(0,(submissions.length/2));
    console.log(submissions);

    // resets the voteCounter properties to zero for next round of voting
    for(var i=0 ; i<submissions.length ; i++){
        submissions[i].voteCounter = 0;
    }
    
    // remders competing-submissions which is fed by the revised array of data
    res.render('competing-submissions', {
        submissions: submissions
      });
});


// selects two submitted videos at random and renders them @ /randomPair
// hold off on this, don't really need it based on new competition plan
// app.get('/randomPair', function(req, res){
//     pairedSubmissions = _.sample(submissions, 2);
//     res.render('randomPair', {
//     pairedSubmissions: pairedSubmissions
//   });

// });

// increments the voteCounter if req.params.voteIndex matches the unique ID of hte object and redirects user back to submissions page
app.get('/vote/:voteIndex', function(req, res){
    for(var i = 0; i < submissions.length; i++){
      if(submissions[i].id === req.params.voteIndex){
        submissions[i].voteCounter++;
        console.log(submissions[i].voteCounter);
      }
    }
    res.redirect('/submissions');
});


// After contest is complete, takes user back to index page, but first resets the array of videos
app.get('/return', function(req, res) {
    submissions = [];
    res.render('index', {
        submissions: submissions
      });
});




var server = app.listen(6682, function() {
	console.log('Express server listening on port ' + server.address().port);
});
