#User roles/profiles
PROFILE_USER = 'USER'
PROFILE_ADMIN = 'ADMIN'

PROFILES = {
    PROFILE_USER: 'User',
    PROFILE_ADMIN: 'Super administrator',
}

MENU_ITEMS = [
    ('admin_index', 'Inicio', [
        PROFILE_ADMIN,
    ]),
    ('settings', u'Configuracion', [
        PROFILE_ADMIN
    ]),
]


# OAUTH2_CLIENT_ID = "233923764866.apps.googleusercontent.com"
OAUTH2_CLIENT_ID = "448548789014-su3rs3853if9vabnpuinr6d4nmku2log.apps.googleusercontent.com"
