package Lingit::Web::Model::Git;

use Lingit::API::Repository;
use Moose;
use namespace::autoclean;

extends 'Catalyst::Model';

has repos => (
    is => 'rw',
    isa => 'Lingit::API::Repository',
    builder => 'build_repos_api',
);

sub build_repos_api {
    my ($self, $c) = @_;
    my $api = Lingit::API::Repository->new;
    return $api;
}

sub init {
    my ($self, $path) = @_;

    return $self->repos->init($path);
}

sub get_reposes {
    my $self = shift;

    my @reposes = $self->repos->get_reposes;
    return @reposes;
}

sub get_manage_repos {
    my ($self, $id) = @_;

    my $row = $self->repos->get_manage_repos($id);
    return $row;
}

sub get_status {
    my ($self, $path) = @_;

    my $status = $self->repos->get_status($path);
    return $status;
}

sub add {
    my ($self, $path) = @_;

    $self->repos->add($path);
}

=head1 NAME

Lingit::Web::Model::Git - Catalyst Model

=head1 DESCRIPTION

Catalyst Model.

=head1 AUTHOR

Kazuhiro Shibuya

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
