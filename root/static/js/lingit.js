
$(function() {
    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    var Repository = Backbone.Model.extend({});
    var RepositoryList = Backbone.Collection.extend({
        model: Repository
    });

    var ReposView = Backbone.View.extend({
        el: $("#reposapp"),
        events: {
            "click #createbtn": "addRepository"
        },
        initialize: function(reposies) {
            _.bindAll(this, "addOne", "addAll", "render");
            this.reposies = reposies;
            this.reposies.bind("add", this.addOne);
            this.reposies.bind("refresh", this.addAll);
            this.reposies.model.bind("change", this.render);
            this.reposies.model.view = this;
        },
        render: function(repos) {
            this.el = ich.repos(repos.toJSON());
            return this;
        },
        addRepository: function() {
            this.reposies.url = "/repository/create";
            this.reposies.create({ path: $("#path").val() });
            $("#path").val('');
        },
        addOne: function(repos) {
            $("#reposlist").append(this.render(repos).el);
        },
        addAll: function() {
            this.reposies.each(this.addOne);
        },
    });

    var StatusView = Backbone.View.extend({
        el: $("#reposapp"),
        initialize: function(repos) {
            _.bindAll(this, "render", "updateStatus");
            this.repos = repos;
            this.repos.bind("updateStatus", this.updateStatus);
        },
        render: function() {
            this.el = ich.status(this.repos.toJSON());
            return this;
        },
        updateStatus: function() {
            $("#reposapp").append(this.render(this.repos).el);
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
            var reposview = new ReposView(reposies);
            this.reposview = reposview;

        },
        list: function() {
            var that = this;
            $.getJSON("/repository/list", function(data) {
                if (data) {
                    $("#reposlist").empty();
                    that.reposview.reposies.add(_(data).map(function(i) { return new Repository(i); }));
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
                    var repos = that.reposview.reposies.get(id);
                    repos.set({status: data.status});
                    repos.set({untracks: data.untracks});
                    var statusview = new StatusView(repos);
                    that.statusview = statusview;
                    that.statusview.repos.trigger("updateStatus", repos);
                } else {
                    //Error
                }
            })
        }
    });
    new LingitController;
    Backbone.history.start();
});