package Lingit::Web::Controller::Repository;
use Moose;
use namespace::autoclean;

BEGIN {extends 'Catalyst::Controller'; }

=head1 NAME

Lingit::Web::Controller::Repository - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut


=head2 index

=cut

sub index :Path :Args(0) {
    my ( $self, $c ) = @_;

    my @reposes = $c->model('Git')->get_reposes;
    $c->stash(reposes => \@reposes);
}

=head2 create

=cut

sub create :Path('create') :Args(0) {
    my ( $self, $c ) = @_;

    my $path = $c->request->params->{path};
    $c->model('Git')->init($path);
    $c->res->redirect('/repository');
}

=head1 AUTHOR

Kazuhiro Shibuya

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
