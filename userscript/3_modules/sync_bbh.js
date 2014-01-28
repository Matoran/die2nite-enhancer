Module.register(function() {

    var MODULE_NAME = 'sync_bbh';

    /******************
     * Module context *
     ******************/

    var update_method_ = 'POST';
    var update_url_ = 'http://bbh.fred26.fr/update.php';

    /**
     * Add the i18n strings for this module.
     */
    function add_i18n()
    {
        var i18n = {};

        i18n[I18N.LANG.FR] = {};
        i18n[I18N.LANG.FR][MODULE_NAME + '_short_desc'] = 'Activer la synchronisation BBH';
        i18n[I18N.LANG.FR][MODULE_NAME + '_full_desc'] = 'Ajoute la possibilité de synchroniser avec BigBroth\'Hordes.';

        I18N.set(i18n);
    }


    /************************
     * Module configuration *
     ************************/

    return {

        name: MODULE_NAME,
        type: Module.TYPE.EXTERNAL_TOOL,

        properties: {
            enabled: false,
            tool: {
                directory_id: 51,
                api_key: null,
                update_method: 'POST',
                update_url: 'http://'
            }
        },

        configurable: {
            enabled: {
                type: Module.PROPERTIES.BOOLEAN,
                short_desc_I18N: MODULE_NAME + '_short_desc',
                full_desc_I18N: MODULE_NAME + '_full_desc'
            }
        },

        actions: {
            can_run: function() {
                return D2N.is_on_hordes();
            },

            init: function() {
                add_i18n();
            },

            update: function(callback_success, callback_failure) {
                JS.network_request(
                    this.properties.tool.update_method,
                    this.properties.tool.update_url,
                    'key=' + this.properties.tool.api_key + '&action=force_maj',
                    {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    function(response_text) {
                        // if response is too short, it is incomplete because
                        // the user is not logged
                        if (response_text.length < 20000) {
                            return callback_failure();
                        }
                        return callback_success();
                    },
                    function() {
                        return callback_failure();
                    }
                );
            }
        }

    };
});