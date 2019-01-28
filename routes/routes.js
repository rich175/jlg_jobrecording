require('express');
var users = require(__base + '/models/users');
module.exports = function(app) {
    // ROUTES FOR THE API V1
    var companyRoutes = require('./v1/company');
    var contactRoutes = require('./v1/contact');
    var authRoutes = require('./v1/auth/authentication');



    var fileUploadRoutes = require('./v1/fileUpload/fileUpload');

    //ROUTES FOR JLG reports
    var jobSheetRoutes = require('./v1/reports/createJobSheet');
	    var workSummaryRoutes = require('./v1/reports/workSummary');
    var jobList = require('./v1/general/jobList');
    var jobsFinished = require('./v1/general/jobsFinished');
    var jobsInProgress = require('./v1/general/jobsInProgress');
    var jobsInvoiced = require('./v1/general/jobsInvoiced');
    var workRoutes = require('./v1/work/work');
    var jobsRoutes = require('./v1/general/jobs');
    var jobRoutes = require('./v1/general/job');
    var jobStatusRoutes = require('./v1/general/jobStatus');
    var customersRoutes = require('./v1/customers/customers');
    var jobNotesRoutes = require('./v1/jobNotes/jobNotes.js');
	    var userRoutes = require('./v1/users/users.js');

    //ROUTES FOR JLG material handling
    var matConsumptionRoutes = require('./v1/material/consumption');
    var matEntryRoutes = require('./v1/material/entry');
    var matStockRoutes = require('./v1/material/stock');
    var matCatsRoutes = require('./v1/material/categories');
    var suppliersRoutes = require('./v1/material/suppliers');
    var matUnitRoutes = require('./v1/material/units');
    var partnumberRoutes = require('./v1/material/partnumber');


      var pnCalcRoutes = require('./v1/pn_calculator/pn_calculator');


    // REGISTER ROUTES
    app.use('/api/v1/company', isAuthenticated, companyRoutes);
    app.use('/api/v1/contact', isAuthenticated, contactRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/upload', fileUploadRoutes);


    //Reports

    app.use('/api/v1/reports/createJobSheet', isAuthenticated, jobSheetRoutes);
	  app.use('/api/v1/reports/workSummary', isAuthenticated, workSummaryRoutes);
    app.use('/api/v1/general/jobList', isAuthenticated, jobList);
    app.use('/api/v1/general/jobs', isAuthenticated, jobsRoutes);
    app.use('/api/v1/general/job', isAuthenticated, jobRoutes);
    app.use('/api/v1/general/jobStatus', isAuthenticated, jobStatusRoutes);
    app.use('/api/v1/customers/customers', isAuthenticated, customersRoutes);
    app.use('/api/v1/general/jobsFinished', isAuthenticated, jobsFinished);
    app.use('/api/v1/general/jobsInProgress', isAuthenticated, jobsInProgress);
    app.use('/api/v1/general/jobsInvoiced', isAuthenticated, jobsInvoiced);
    app.use('/api/v1/work/work', isAuthenticated, workRoutes);
    app.use('/api/v1/jobNotes/jobNotes', isAuthenticated, jobNotesRoutes);
	  app.use('/api/v1/users/users', isAuthenticated, userRoutes);

    //ROUTES FOR JLG material handling
    app.use('/api/v1/material/consumption', isAuthenticated, matConsumptionRoutes);
    app.use('/api/v1/material/entry', isAuthenticated, matEntryRoutes);
    app.use('/api/v1/material/stock', isAuthenticated, matStockRoutes);
    app.use('/api/v1/material/categories', isAuthenticated, matCatsRoutes);
    app.use('/api/v1/material/suppliers', isAuthenticated, suppliersRoutes);
    app.use('/api/v1/material/units', isAuthenticated, matUnitRoutes);
    app.use('/api/v1/material/partnumber', isAuthenticated, partnumberRoutes);

    //example to do route authorisation
    //  app.use('/api/v1/upload', isAuthenticated, isAuthorised(0), fileUploadRoutes);

      app.use('/api/v1/pn_calculator/pn_calculator', isAuthenticated, pnCalcRoutes);


    // Matched no API routes
    app.use(function(req, res, next) {
        next();
    });
};

function isAuthenticated(req, res, next) {
    // Check header or url parameters or post parameters for token
    var token = req.headers['x-access-token'];
    logger.info('Received Token :' + token);
    users.isAuthenticated(token, function(decodedToken) {
        if (decodedToken) {
            logger.info('Token Valid: Authorised');
            res.locals.userData = decodedToken; //add user data to response object so each function can use it without decoding required
            return next();
        }
        logger.info('Token Invalid: Not Authorised!');
        res.status(401).send('Unauthorized');
    });
}

function isAuthorised(role, req, res, next) {
    // Check user has right priveledges for this route
    return function(req, res, next) {

        if (res.locals.userData.userRole === role)
            next();
        else
            res.status(403).send('Forbidden');
    }
}
