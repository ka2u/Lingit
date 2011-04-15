package Lingit::Web::View::Xslate;
use Moose;

extends 'Catalyst::View::Xslate';

has '+syntax' => ( default => 'TTerse' );

has '+module' => (
    default => sub { [ 'Text::Xslate::Bridge::TT2' ] }
);


1;

=head1 NAME

Lingit::Web::View::Xslate - Xslate View for Lingit::Web

=head1 DESCRIPTION

Xslate View for Lingit::Web.

=cut
