/**
 * Created by jovinbm on 1/19/15.
 */
angular.module('qaApp')
    .factory('questionService', ['$http', function ($http) {
        return {
            getQuestions: function (currentQuestionIndexObject) {
                return $http.post('/api/getQuestions', currentQuestionIndexObject);
            },

            retrieveQuestion: function (index) {
                return $http.post('/api/retrieveQuestion', {"index": index});
            },

            postQuestion: function (questionObject) {
                var shortQuestion = "";
                //trim 130 characters to be used for top voted
                if (questionObject.theQuestion.length > 130) {
                    for (var i = 0; i < 130; i++) {
                        shortQuestion = shortQuestion + questionObject.theQuestion[i];
                    }
                    shortQuestion = shortQuestion + "...";
                } else {
                    shortQuestion = questionObject.theQuestion;
                }
                var questionToDatabase = {
                    "heading": questionObject.theHeading,
                    "question": questionObject.theQuestion,
                    "shortQuestion": shortQuestion
                };
                return $http.post('/api/newQuestion', questionToDatabase);
            },

            postEditedQuestion: function (questionObject) {
                var shortQuestion = "";
                //trim 130 characters to be used for top voted
                if (questionObject["question"].length > 130) {
                    for (var i = 0; i < 130; i++) {
                        shortQuestion = shortQuestion + questionObject["question"][i];
                    }
                    shortQuestion = shortQuestion + "...";
                } else {
                    shortQuestion = questionObject["question"];
                }
                questionObject["shortQuestion"] = shortQuestion;
                return $http.post('/api/updateQuestion', questionObject);
            },

            postUpvote: function (upvoteIndex) {
                var upvoteToDatabase = {
                    "upvoteIndex": upvoteIndex
                };
                return $http.post('/api/newUpvote', upvoteToDatabase);
            }
        }
    }]);