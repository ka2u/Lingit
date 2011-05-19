
$(function() {
    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    var Repository = Backbone.Model.extend({});
    var RepositoryList = Backbone.Collection.extend({
        model: Repository
    });
    var File = Backbone.Model.extend({});
    var FileList = Backbone.Collection.extend({
        model: File
    });

    var Diff = Backbone.Model.extend({});

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
        events: {
            "click #addbtn": "addUntracked",
            "click #commitbtn": "commitTracked",
            "click #diffbtn": "diffTracked"
        },
        initialize: function(repos) {
            _.bindAll(this, "render", "trackRender", "updateStatus", "trackOne", "temporary");
            this.repos = repos;
            this.repos.bind("updateStatus", this.updateStatus);
            this.untracked = new FileList();
            this.untracked.bind("add", this.trackOne);
            this.commits = new FileList();
            this.commits.bind("add", this.temporary);
        },
        render: function(status) {
            this.el = ich.status(status);
            return this;
        },
        trackRender: function(track) {
            this.el = ich.status_tracks(track);
            return this;
        },
        modRender: function(track) {
            this.el = ich.modified_tracks(track);
            return this;
        },
        updateStatus: function() {
            $("#reposapp").append(this.render({status: this.repos.get("raw").status}).el);
            $("#untracked").append(this.trackRender({tracks: this.repos.get("raw").untracks}).el);
            $("#tracked #new").append(this.trackRender({tracks: this.repos.get("raw").newfile}).el);
            $("#tracked #modified").append(this.modRender({tracks: this.repos.get("raw").modified}).el);
        },
        addUntracked: function() {
            this.untracked.url = "/management/untracked/" + this.repos.id;
            var elements = $("#untracked input:checked");
            for (var i = 0; i < elements.length; i++) {
                var id = $(elements[i]).val();
                $("#" + id).remove();
                this.untracked.create(
                    {name: id},
                    {success: function() { }});
            }
        },
        trackOne: function(file) {
            console.log(file.get("name"));
            $("#new").append(this.trackRender({tracks: [file.get("name")]}).el);
        },
        commitTracked: function() {
            this.commits.url = "/management/tracked/" + this.repos.id;
            console.log(this.commits.url);
            var elements = $("#tracked input:checked");
            for (var i = 0; i < elements.length; i++) {
                var id = $(elements[i]).val();
                console.log("id:" + id);
                var res = this.commits.create({name: id}, 
                                              { success: function() { $("#" + id).remove(); },
                                                error: function(resp) { console.log(resp); } });
            }
        },
        diffTracked: function(events) {
            console.log("diffTracked");
            console.log(events.target);
            console.log($(event.target).attr('class'));
            console.log(this.commits);
        },
        temporary: function() {
            console.log("temporary");
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
                    repos.set({raw: data});
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