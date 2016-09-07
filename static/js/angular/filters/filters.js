(function() {
    "use strict";

    angular.module('esmg.filters',[])
    .filter('date', ['$filter', function($filter) {
        return formatDate;
    }])
    .filter('validName', ['$filter', function($filter) {
        return function(name) {
            // validation for splice log format
            if (name && typeof(name).match(/string/i)) {
                name = name ? name.replace(/[&#=,'":\[\]\{\}<>¿\?]/gi,'').replace(/ {2,}/g, ' ').trim() : '';

            }
            return name;
        };
    }])
    .filter('dateHours', ['$filter', function($filter) {
        return function(date) {

            if (!date) {
                return date;
            }

            var localDate = formatDate(date);
            // Extract HH:MM
            var dateHours = localDate.match(/\d{2}:/g);
            return dateHours[0] + dateHours[1].replace(/:$/, ''); // HH:MM
        };
    }])
    .filter('dateDayName', ['$filter', function($filter) {
        return function(date) {

            if (!date) {
                return date;
            }

            // Extract HH:MM
            var localDateSplite = formatDate(date).match(/\d{2,4}/g);
            var dateDay = new Date(localDateSplite[0], localDateSplite[1], localDateSplite[2]);
            return window.DAYS[dateDay.getDay()]; // HH:MM
        };
    }]);

    /*
    * Convert UTC to local date
    * @param string "" dateISO format
    * @format 2016-08-05T13:23:03.063480
    * @format 2016-08-05 17:37:56
    */
    function formatDate(date) {
        // The format date is UTC0, this is converted to NAV Date
        try {
            // Create new time from date recived
            var ds = date.split(/-|\s|:|T/); // date split in: AAAA|MM|DD|h|m|s
            var nDate = new Date(Date.UTC(ds[0], (ds[1]-1), ds[2], ds[3], ds[4]));
            // Create referece offset in milliseconds
            var tzoffset = (new Date()).getTimezoneOffset() * 60000;
            // Create Zone time and extract string
            var nDate = (new Date(nDate - tzoffset)).toISOString().slice(0,-1);

            // Prepare format string
            if (nDate && nDate.match(/\dT\d/) ) {
                nDate = nDate.replace(/T/,' - ').replace(/\.(\d|\w)+$/, '');
            }
            // Return new date
            return nDate;

        } catch(e) {
            console.warn('error on filter date: ', e);
            return date  + ' (UTC 0)';
        }
    };

})();
