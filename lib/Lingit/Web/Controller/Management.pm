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
    my $untrack_flag = 0;
    my $change_flag = 0;
    my @untracked;
    my @to_be_commit;
    foreach my $line (split("\n", $status)) {
        if ($line =~ /Untracked files:/) {
            $change_flag = 0;
            $untrack_flag = 1;
            next;
        }
        if ($line =~ /nothing added to commit/) {
            $untrack_flag = 0;
            last;
        }
        if ($line =~ /Changes to be committed:/) {
            $untrack_flag = 0;
            $change_flag = 1;
            next;
        }
        if ($line =~ /Changes not staged for commit:/) {
            $untrack_flag = 0;
            $change_flag = 1;
            next;
        }
        next if $line =~ /^#\s\s\s\(use/;
        next if $line =~/^#$/;
        $line =~ /^#\s([\w\W\/]+)/;
        my $file = $1;
        push @untracked, $file if $untrack_flag;
        push @to_be_commit, $file if $change_flag;
    }
    $c->stash(
        json_data => {
            id => $id, 
            status => $status, 
            untracks => \@untracked, 
            to_be_commit => \@to_be_commit
        });
    $c->forward("View::JSON");
}

=head2 add

=cut

sub untracked :Regex('^management/untracked/(\d+)') {
    my ( $self, $c ) = @_;

    my $data = JSON->new->decode($c->request->params->{model});
    $c->log->debug(Dumper $data);
    my $id = $c->req->captures->[0];
    my $row = $c->model('Git')->get_manage_repos($id);
    $c->model('Git')->add($row->first->get_column('path') . "/" . $data->{name});
    $c->stash(json_data => $data);
    $c->forward("View::JSON");
}


=head1 AUTHOR

Kazuhiro Shibuya

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
