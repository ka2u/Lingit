#!/usr/bin/env perl
use strict;
use warnings;
use Lingit::Web;

Lingit::Web->setup_engine('PSGI');
my $app = sub { Lingit::Web->run(@_) };

