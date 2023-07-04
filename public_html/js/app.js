/**
 * INSPINIA - Responsive Admin Theme
 *
 */
(function () {
    angular.module('inspinia', [
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
        'auth',
        'authHelper',
		    'dash',
		    'report-generator',
		    'datatables.buttons',
        'thatisuday.dropzone',

        'file-management',
        'job-sheet',
        'job-search',
        'jlg_services',
        'enter-work',
        'create-job',
        'edit-job',
        'edit-work',
        'customers',
        'edit-customers',
        'view-customer',
        'assign-job',
        'add-note',
        'all-jobs',
        'material-in',
        'material-stock',
        'engineers-details',
    ])
})();
