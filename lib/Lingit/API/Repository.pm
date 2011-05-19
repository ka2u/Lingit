package Lingit::API::Repository;

use Moose;
use namespace::clean -except => qw(meta);

use Git::Class;
use Lingit::Model;
use Time::Piece;
use Data::Dumper;

has repos => (
    is => 'rw',
    isa => 'Git::Class',
    builder => '_build_repos',
);

has worktree => (
    is => 'rw',
    isa => 'Git::Class::Worktree',
    clearer => 'clear_worktree',
);

has db => (
    is => 'rw',
    isa => 'Lingit::Model',
    builder => '_build_db',
);

sub _build_repos {
    my $repos = Git::Class->new;
    return $repos;
}

sub _build_db {
    my $db = Lingit::Model->new({
        dsn => 'dbi:SQLite:dbname=/Users/kaz/mywork/dev/Lingit-Web/db/lingit.db',
        username => '',
        password => '',
    });
    return $db;
}

sub init {
    my ($self, $path) = @_;

    #TODO more restrict?
    return if -e $path . "/.git";
    my $t = localtime;
    my $row = $self->db->insert('repository', {path => $path, create_date => $t->cdate});
    $self->repos->init($path);
    return $row;
}

sub get_reposes {
    my $self = shift;

    my @reposes = $self->db->search_named(q{SELECT rowid, path FROM repository}, {});
    return @reposes;
}

sub get_manage_repos {
    my ($self, $id) = @_;

    my $row = $self->db->search_named(q{SELECT path FROM repository WHERE rowid = :id}, {id => $id});
    $self->clear_worktree;
    my $worktree = Git::Class::Worktree->new(path => $row->first->get_column('path'));
    $self->worktree($worktree);
    return $row;
}

sub get_status {
    my ($self, $path) = @_;

    my $status = $self->worktree->status;
    return $status;
}

sub add {
    my ($self, $path) = @_;

    $self->worktree->add($path);
}

sub commit {
    my ($self, $path) = @_;

    $self->worktree->commit({message => 'auto commited'}, $path);
}

sub diff {
    my ($self, $path) = @_;

    my $diff = $self->worktree->diff($path);
    return $diff;
}

__PACKAGE__->meta->make_immutable();

1;
