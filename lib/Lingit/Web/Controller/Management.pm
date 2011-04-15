package Lingit::Web::Controller::Management;
use Moose;
use namespace::autoclean;
use Data::Dumper;

BEGIN {extends 'Catalyst::Controller'; }

=head1 NAME

Lingit::Web::Controller::Management - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut


=head2 index

=cut

sub index :Regex('^management/(\d+)') {
    my ( $self, $c ) = @_;

    my $id = $c->req->captures->[0];
    my $row = $c->model('Git')->get_manage_repos($id);
    my $status = $c->model('Git')->get_status($row->first->get_column('path'));
    $c->stash->{status} = $status;
    $c->stash->{id} = $id;
}

=head2 add

=cut

sub add :Regex('^management/add/(\d+)') {
    my ( $self, $c ) = @_;

    my $id = $c->req->captures->[0];
    my $row = $c->model('Git')->get_manage_repos($id);
    $c->model('Git')->add($row->first->get_column('path'));
    $c->res->redirect("/management/$id");
}


=head1 AUTHOR

Kazuhiro Shibuya

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
