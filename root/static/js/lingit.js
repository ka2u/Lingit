
$(function() {
    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    var Repository = Backbone.Model.extend({});
    var RepositoryList = Backbone.Collection.extend({
        model: Repository
    });

    var ReposView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.view = this;
        },
        render: function() {
            this.el = ich.repos(this.model.toJSON());
            return this;
        }
    });

    var LingitView = Backbone.View.extend({
        el: $("#reposapp"),
        events: {
            "click #createbtn": "addRepository"
        },
        initialize: function(reposies) {
            _.bindAll(this, 'addOne', 'addAll');
            this.input = this.$("#path");
            this.reposies = reposies;
            this.reposies.bind("add", this.addOne);
            this.reposies.bind("refresh", this.addAll);
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
    });

    var LingitController = Backbone.Controller.extend({
        routes: {
            ""               : "list",
            "list"           : "list",
            "status/:id"     : "status",
            "diff/:id/:file" : "diff"
        },
        list: function() {
            $.getJSON("/repository/list", function(data) {
                if (data) {
                    $("#reposlist").empty();
                    var reposies = new RepositoryList;
                    var lingitview = new LingitView(reposies);
                    lingitview.reposies.add(_(data).map(function(i) { return new Repository(i); }));
                } else {
                    //Error
                }
            });
        },
        status: function() {
        }
    });
    new LingitController;
    Backbone.history.start();
});