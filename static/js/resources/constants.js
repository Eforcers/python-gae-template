'use strict';
window.API_ROOT = 'https://PROJECT.appspot.com/_ah/api';
window.API_LOCAL = 'http://localhost:8080/_ah/api';
// Global for replace in tinymce
window.findDomain = function() {
    // Validate exists Domain

    if (!window.DOMAIN) {

        if( location.href.match(/\/a\/.+/i) ) {
            window.DOMAIN = location.href.match(/\/a\/.+/i);
            // split url multitenant
            window.DOMAIN = window.DOMAIN[0].substr(3).replace(/\/.+/ig,'');
            console.info('window.DOMAIN was extract from Url tenant: ', window.DOMAIN);

        } else if ( window.user_email ) {
            window.DOMAIN = window.user_email.match(/@.+$/)[0].replace('@', '');
            console.warn('window.DOMAIN was extract from to split g.user_email:', window.DOMAIN );

        }
    }

    return window.DOMAIN;
}

// var CLIENT_ID = "233923764866.apps.googleusercontent.com";
window.CLIENT_ID = "448548789014-su3rs3853if9vabnpuinr6d4nmku2log.apps.googleusercontent.com";
window.SCOPES = "https://www.googleapis.com/auth/userinfo.email"
