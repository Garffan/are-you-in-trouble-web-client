/**
 * Created by garffan on 11/5/13.
 */


angular.module('helpdesk.service').service('profilesProvider', function (networkManager) {
    var serviceModel = {
        _storage : [],

        getProfiles : function () {
            return this._storage;
        },

        insert : function (data) {
            this._storage.push(data);
        },

        clean : function () {
            this._storage.length = 0;
        },

        save : function (data) {
            var self = this;
            networkManager.emit('profiles:save', function (savedData) {
                self.insert(savedData);
            });
        },

        getProfilesFromServer : getProfilesFromServer,

        /* events : new EventEmitter({
         'filters set changed' : [],
         'filters got' : []
         })*/

        offset : 0,
        limit : 22
    };

    function getProfilesFromServer (getAll, params, callback) {
        var filters = {};
        if (getAll) {
            filters = { offset: 0, limit: 22, filters : {} };
        }

        filters.filters = {};

        if (params) {
            filters.filters = params.filters;
        }

        console.log("AST: %o", filters);
        console.log("LENN: " + serviceModel._storage.length);

        if (!filters.filters) { return; }

        networkManager.request('profiles:retrieve', filters, function (data) {
            var i = 0, len = data.length;

            if (!callback)
                serviceModel.clean();

            while (i < len) {
                serviceModel.insert(data[i]);
                ++i;
            }

            if (!callback) {
                serviceModel.offset = 22;
            }

            if (data.length != 0) {
                serviceModel.limit = 10;
                if (callback)
                    serviceModel.offset += serviceModel.limit;
            }

            if (callback) {
                callback(data);
            }
        });
    }

    globalEvents.addEventListener('login', function () {
        getProfilesFromServer();
    });

    return serviceModel;
});