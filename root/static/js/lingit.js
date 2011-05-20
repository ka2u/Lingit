
$(function() {
    Backbone.emulateHTTP = true;
    Backbone.emulateJSON = true;

    var Repository = Backbone.Model.extend({});
    var RepositoryList = Backbone.Collection.extend({
        model: Repository
    });
    var File = Backbone.Model.extend({});
    var UntrackList = Backbone.Collection.extend({
        model: File
    });
    var TrackedList = Backbone.Collection.extend({
        model: File
    });
    var ModifiedList = Backbone.Collection.extend({
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
            "click #addbtn": "addUntracks",
            "click #commitbtn": "commitTracked",
            "click #diffbtn": "diffTracked"
        },
        initialize: function(options) {
            _.bindAll(this, "render", "trackRender", "untrackOne", "trackedOne", "modOne", "temporary");
            this.status = options.status;
            this.repos = options.repos;
            this.untracklist = options.untracklist;
            this.untracklist.bind("add", this.untrackOne);
            this.trackedlist = options.trackedlist;
            this.trackedlist.bind("add", this.trackedOne);
            this.modlist = options.modlist;
            this.modlist.bind("add", this.modOne);
            $("#reposapp").append(this.render({status: this.status}).el);
            return this;
        },
        render: function(status) {
            this.el = ich.status(status);
            return this;
        },
        trackRender: function(file) {
            this.el = ich.status_tracks(file);
            return this;
        },
        modRender: function(track) {
            this.el = ich.modified_tracks(track);
            return this;
        },
        addUntracks: function() {
            this.trackedlist.url = "/management/untracked/" + this.repos.id;
            var elements = $("#untracks input:checked");
            for (var i = 0; i < elements.length; i++) {
                var id = $(elements[i]).val();
                $("#" + id).remove();
                var model = this.untracklist.getByCid(id);
                this.trackedlist.create(
                    {name: model.get("name")});
                this.untracklist.remove(model);
            }
        },
        commitTracked: function() {
            var elements = $("#files input:checked");
            for (var i = 0; i < elements.length; i++) {
                var id = $(elements[i]).val();
                var t_model = this.trackedlist.getByCid(id);
                var m_model = this.modlist.getByCid(id);
                var model;
                if (t_model == undefined) {
                    this.modlist.remove(m_model);
                    var tracked = _.detect(this.trackedlist.models, 
                                           function(model) { return model.get("name") == m_model.get("name") });
                    if (tracked != undefined) {
                        this.trackedlist.remove(tracked);
                        $("#tracked #" + tracked.cid).remove();
                    }
                    model = m_model;
                } else {
                    this.trackedlist.remove(t_model);
                    console.log(this.modlist.models);
                    var modified = _.detect(this.modlist.models, 
                                           function(model) { return model.get("name") == t_model.get("name") });
                    if (modified != undefined) {
                        this.modlist.remove(modified);
                        $("#modified #" + modified.cid).remove();
                    }
                    model = t_model;
                }
                model.url = "/management/tracked/" + this.repos.id;
                model.save({name : model.get("name")},
                           { success: function() { $("#" + id).remove(); },
                             error: function(resp) { console.log(resp); } });
            }
        },
        untrackOne: function(file) {
            $("#untracks").append(this.trackRender({name : file.get("name"), cid : file.cid}).el);
        },
        trackedOne: function(file) {
            $("#tracked").append(this.trackRender({name : file.get("name"), cid : file.cid}).el);
        },
        modOne: function(file) {
            $("#modified").append(this.trackRender({name : file.get("name"), cid : file.cid}).el);
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
            var reposies = new RepositoryList();
            this.reposview = new ReposView(reposies);
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
                    var repos = that.reposview.reposies.get(id);
                    var untracklist = new UntrackList();
                    var trackedlist = new TrackedList();
                    var modlist = new ModifiedList();
                    $("#reposapp").empty();
                    that.statusview = new StatusView(
                        {untracklist : untracklist,
                         trackedlist : trackedlist,
                         modlist : modlist,
                         repos : repos,
                         status: status});
                    for (var i = 0; i < data.untracks.length; i++) {
                        that.statusview.untracklist.add(new File({name : data.untracks[i]}));
                    }
                    for (var i = 0; i < data.tracked.length; i++) {
                        that.statusview.trackedlist.add(new File({name : data.tracked[i]}));
                    }
                    for (var i = 0; i < data.modified.length; i++) {
                        that.statusview.modlist.add(new File({name : data.modified[i]}));
                    }
                } else {
                    //Error
                }
            })
        }
    });
    new LingitController;
    Backbone.history.start();
});