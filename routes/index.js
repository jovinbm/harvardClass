//handling login.html and chat.html requests
exports.loginHtml = function (req, res) {
    res.sendfile("public/login.html");
};

exports.chatHtml = function (req, res) {
    res.sendfile("public/chat.html");
};

//handling css requests
exports.bootstrapCss = function (req, res) {
    res.sendfile("css/assets/bootstrap.min.css");
}

exports.customCss = function (req, res) {
    res.sendfile("css/custom.css");
};


//handling js requests
exports.jqueryJs = function (req, res) {
    res.sendfile("js/assets/jquery-2.1.1.min.js");
};

exports.bootstrapJs = function (req, res) {
    res.sendfile("js/assets/bootstrap.min.js");
};

exports.respondJs = function (req, res) {
    res.sendfile("js/assets/respond.js");
};
exports.loginJs = function (req, res) {
    res.sendfile("js/customlogin.js");
};

exports.chatJs = function (req, res) {
    res.sendfile("js/customchat.js");
};

//handling the socket.io request
exports.socketIo = function (req, res) {
    res.sendfile("socket.io/socket.io.js");
};