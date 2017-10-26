try{
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-00000000-0', 'xertica.com');  // Creates a tracker.
    var page = window.location.pathname;

    var titleGA;
    var pageGA;

    ga('send', 'pageview');

} catch(error) {
    console.warn('error on execute analytics', error);
}
