package Lingit::Web::Controller::Repository;
use Moose;
use namespace::autoclean;
use Data::Dumper;
use JSON;

BEGIN {extends 'Catalyst::Controller'; }

=head1 NAME

Lingit::Web::Controller::Repository - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut


=head2 index

=cut

sub index :Path('') :Args(0) {
    my ( $self, $c ) = @_;

    my @reposes = $c->model('Git')->get_reposes;
    $c->stash(reposes => \@reposes);
}

=head2 list

=cut

sub list :Path('list') {
    my ( $self, $c ) = @_;

    my @reposes = $c->model('Git')->get_reposes;
    my @data;
    foreach my $repos (@reposes) {
        push @data, {id => $repos->rowid, path => $repos->path};
    }
    $c->stash(json_data => \@data);
    $c->forward('View::JSON');
}

=head2 create

=cut

sub create :Path('create') {
    my ( $self, $c ) = @_;

    my $path = JSON->new->decode($c->request->params->{model})->{path};
    $c->log->debug(Dumper $path);
    my $row = $c->model('Git')->init($path);
    $c->stash(json_data => { id => $row->id, path => $row->path });
    $c->forward('View::JSON');
}

=head1 AUTHOR

Kazuhiro Shibuya

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
