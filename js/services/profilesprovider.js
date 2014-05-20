angular.module('helpdesk.service').factory('ProfilesProvider', function (networkManager) {
    var storage = [];

    function insert (data) {
        storage.push(data);
    }

    function save (data) {
        for (var i = 0; i < storage.length; ++i) {
            if (data.id == storage[i].id) {
                for (var p in data) {
                    storage[i][p] = data[p];
                }
                return;
            }
        }
        storage.insert(data);
    }

    networkManager.on('task type:update', function (data) {
        save(data);
    });

    return {
        storage: storage,
        save: save
    };
});