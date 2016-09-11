(function(){
    "use strict";

    tinymce.PluginManager.add('esmgPlugin', function(editor, url) {
        // Add a button that opens a window
        //addTagMenu
        var buttons_tags = {
            type: 'menubutton',
            text: 'Tags',
            icon: false,
            menu: []
        };
        var TAGS_SIGN = window.TAGS_SIGN || {};
        for( var tag in TAGS_SIGN ){
            
            buttons_tags.menu.push(
                {
                    text: window.TAGS_SIGN[tag],
                    onclick: function(event) {
                        editor.insertContent( event.target.innerHTML );
                    }
                }
            );

        }
        editor.addButton('addTagMenu', buttons_tags);
    });

})();