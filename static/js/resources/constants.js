'use strict';
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

window.CLIENT_ID = "351669459598-kv1ikqhk3bgtqgpt687rps0jplkv7rrb.apps.googleusercontent.com";
window.SCOPES = "https://www.googleapis.com/auth/userinfo.email"
