/**
 * Created by garffan on 10/3/13.
 */

var TemplateStorage = {
    templates: {},

    getTemplate: function (templateName, callback) {
        var self = this;
        $.ajax({
            url: 'templates/' + templateName + '.html',
            type: 'get',
            success: function (data) {
                self.templates[templateName] = data;
                if (callback) {
                    callback(data);
                }
            }
        });
    }
};