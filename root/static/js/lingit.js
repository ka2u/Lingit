
$(function() {
    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    var Repository = Backbone.Model.extend({});
    var RepositoryList = Backbone.Collection.extend({
        model: Repository
    });

    var ReposView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, "render");
            this.model.bind("change", this.render);
            this.model.view = this;
        },
        render: function() {
            this.el = ich.repos(this.model.toJSON());
            return this;
        }
    });

    var StatusView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, "render");
            this.model.bind("change",  this.render);
            this.model.view = this;
        },
        render: function() {
            this.el = ich.status(this.model.toJSON());
            return this;
        }
    });

    var LingitView = Backbone.View.extend({
        el: $("#reposapp"),
        events: {
            "click #createbtn": "addRepository"
        },
        initialize: function(reposies) {
            _.bindAll(this, 'addOne', 'addAll', 'updateStatus');
            this.input = this.$("#path");
            this.reposies = reposies;
            this.reposies.bind("add", this.addOne);
            this.reposies.bind("refresh", this.addAll);
            this.reposies.bind("updateStatus", this.updateStatus);
        },
        addRepository: function() {
            reposies.url = "/repository/create";
            reposies.create({ path: this.input.val() });
            this.input.val('');
        },
        addOne: function(repos) {
            var reposview = new ReposView({model: repos});
            this.$("#reposlist").append(reposview.render().el);
        },
        addAll: function() {
            reposies.each(this.addOne);
        },
        updateStatus: function(repos) {
            var statusview = new StatusView({model: repos});
            $("#reposapp").append(statusview.render().el);
        }
    });

    var LingitController = Backbone.Controller.extend({
        routes: {
            ""               : "list",
            "list"           : "list",
            "status/:id"     : "status",
            "diff/:id/:file" : "diff"
        },
        initialize: function() {
            var reposies = new RepositoryList;
            var lingitview = new LingitView(reposies);
            this.lingitview = lingitview;
        },
        list: function() {
            var that = this;
            $.getJSON("/repository/list", function(data) {
                if (data) {
                    $("#reposlist").empty();
                    that.lingitview.reposies.add(_(data).map(function(i) { return new Repository(i); }));
                } else {
                    //Error
                }
            });
        },
        status: function(id) {
            var that = this;
            $.getJSON("/management/" + id, function(data) {
                if (data) {
                    $("#reposapp").empty();
                    var repos = that.lingitview.reposies.get(id);
                    repos.set({status: data.status});
                    that.lingitview.reposies.trigger("updateStatus", repos);
                } else {
                    //Error
                }
            })
        }
    });
    new LingitController;
    Backbone.history.start();
});