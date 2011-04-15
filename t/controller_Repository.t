use strict;
use warnings;
use Test::More;


use Catalyst::Test 'Lingit::Web';
use Lingit::Web::Controller::Repository;

ok( request('/repository')->is_success, 'Request should succeed' );
done_testing();
