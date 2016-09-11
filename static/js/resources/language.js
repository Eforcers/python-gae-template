// Is for include translation in all Dicts languages
window.lang_indexed = {
    "en" : "English",
    "es" : "Español"
};
// Dict all languages
window.language_content = {
    "en": {
        "menu_home" : "Home",
        "menu_settings": "Settings",

        "base_loading_message": "Loading...",
        "base_licence_expire": "License expire",

        "settings_title": "General settings",
        "settings_sync_tab": "Sync",
        "settings_language_tab": "Language",
        "settings_licenses_tab": "Licenses open source",
        "settings_language_label": "Language",
        "settings_sync_google": "Sync data from Google Apps now",
        "settings_save": "Close",

        "admin_create": "Create new",
        "admin_create_a": "Create customize",
        "create_name": "Name",
        "create_last_name": "Last name",
        "create_email": "Email",
        "cancel": "Cancel",
        "create": "Create",
        "notify_creation": "Was create",
        "notify_creation_error": "Error on creation",

        "user_delete_title": "Remove user",
        "user_delete_subtitle": "Do you want remove?",
        "user_delete_message": "The user will be removed"
    },

    "es": {
        "menu_home" : "Home",
        "menu_settings": "Configuración general",

        "base_loading_message": "Cargando...",
        "base_licence_expire": "Caducidad de la licencia",

        "settings_title": "Configuración general",
        "settings_sync_tab": "Sincronización",
        "settings_language_tab": "Idioma",
        "settings_licenses_tab": "Licencias de código abierto",
        "settings_language_label": "Idioma",
        "settings_sync_google": "Sincronizar datos de Google Apps ahora",
        "settings_save": "Listo",

        "admin_create": "Crear nuevo",
        "admin_create_a": "Crear personalizada",
        "create_name": "Nombre",
        "create_last_name": "Apellido",
        "create_email": "Email",
        "cancel": "Cancelar",
        "create": "Crear",
        "notify_creation": "Se ha creado",
        "notify_creation_error": "Error al crear",

        "user_delete_title": "Eliminar usuario",
        "user_delete_subtitle": "¿Desea confirmar eliminar?",
        "user_delete_message": "El usuario será eliminado"
    }
};

// Add Map to language to object
(function(){
    // Obtain kesy only for iterate
    var langsList = Object.keys(window.lang_indexed);
    // Iterate forl language labels ['es','en'...]
    for (var i in langsList) {
        // Obtain string language 'es'/'en' to add in each one language dict
        var lang_acronym = langsList[i];
        // Iterate in each language Dict for add 'es':'Español', 'en':'English'
        for (var j in langsList) {
            // language dict for add lang definition
            var langDictToUse = langsList[j];
            // add as key in language Key
            window.language_content[langDictToUse][lang_acronym] = window.lang_indexed[lang_acronym];
        }
    }
})();
