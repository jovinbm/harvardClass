/**
 * Created by jovinbm on 1/19/15.
 */
/**
 * Created by jovinbm on 1/10/15.
 */
angular.module('qaApp')

    .factory('commentService', ['$http', 'globals', function ($http, globals) {
        return {
            getComments: function (questionIndex, lastCommentIndex) {
                return $http.post('/api/getComments', {
                    "questionIndex": questionIndex,
                    "lastCommentIndex": lastCommentIndex
                });
            },


            commentsReference: function (commentsArray, myPromotes, commentsReference) {
                commentsArray.forEach(function (commentObject) {
                    var temp = {};
                    //change time-string from mongodb to actual time
                    var mongoDate = new Date(commentObject.timePosted);
                    temp.commentTime = mongoDate.toDateString() + " " + mongoDate.toLocaleTimeString();

                    var questionIndex = commentObject.questionIndex;
                    var commentIndex = commentObject.commentIndex;
                    var commentClass = "q" + questionIndex + "c" + commentIndex;

                    temp.commentIndex = commentIndex;
                    temp.commentClass = commentClass;

                    function searchArrayIfExists(name, theArray) {
                        return (theArray.indexOf(name) > -1)
                    }

                    /*if already updated, insert a new button class with a btn-warning class, and a disabled attribute*/
                    if (searchArrayIfExists(commentObject.uniqueId, myPromotes)) {
                        temp.buttonClass = commentClass + "b" + " btn btn-default btn-xs promote";
                        temp.ifDisabled = true;
                    } else {
                        temp.buttonClass = commentClass + "b" + " btn btn-default btn-xs promote";
                        temp.ifDisabled = false;
                    }

                    commentsReference[commentIndex] = temp;
                });

                return commentsReference;
            },


            postComment: function (commentObject) {
                var shortComment = "";
                //trim 130 characters to be used for partial show
                if (commentObject.theComment.length > 130) {
                    for (var i = 0; i < 130; i++) {
                        shortComment = shortComment + commentObject.theComment[i];
                    }
                    shortComment = shortComment + "...";
                } else {
                    shortComment = commentObject.theComment;
                }
                var commentToDatabase = {
                    "comment": commentObject.theComment,
                    "shortComment": shortComment,
                    "questionIndex": commentObject.questionIndex
                };

                return $http.post('/api/newComment', commentToDatabase);
            },

            postPromote: function (questionIndex, commentIndex, uniqueId) {
                var promote = {
                    "questionIndex": questionIndex,
                    "commentIndex": commentIndex,
                    "uniqueId": uniqueId
                };

                return $http.post('/api/newPromote', promote);
            }
        }
    }]);