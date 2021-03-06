package Lingit::Web::Model::DB;
use Moose;
use namespace::autoclean;

extends 'Catalyst::Model';


=head1 NAME

Lingit::Web::Model::DB - Catalyst Model

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
