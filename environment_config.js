module.exports = function () {
    switch (process.env.NODE_ENV) {
        case 'development':
            return {
                returnURL: "http://localhost:3000/harvardId",
                realmURL: 'http://localhost:3000/'
            };

        case 'production':
            return {
                returnURL: "https://harvardclass.herokuapp.com/harvardId",
                realmURL: "https://harvardclass.herokuapp.com/"
            };

        default:
            return {
                returnURL: "https://harvardclass.herokuapp.com/harvardId",
                realmURL: "https://harvardclass.herokuapp.com/"
            };
    }
};