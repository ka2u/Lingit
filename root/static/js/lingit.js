
$(function() {
    var Repository = Backbone.Model.extend({});
    var RepositoryList = Backbone.Collection.extend({
        model: Repository
    });
    var reposies = new RepositoryList;

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

    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;
    var AppView = Backbone.View.extend({
        el: $("#reposapp"),
        events: {
            "click #createbtn": "addRepository"
        },
        initialize: function() {
            _.bindAll(this, 'addOne', 'addAll');
            this.input = this.$("#path");
            reposies.bind("add", this.addOne);
            reposies.bind("refresh", this.addAll);

            reposies.url = "/repository/list";
            reposies.fetch();
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

    var app = new AppView;
});