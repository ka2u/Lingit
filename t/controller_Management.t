use strict;
use warnings;
use Test::More;


use Catalyst::Test 'Lingit::Web';
use Lingit::Web::Controller::Management;

ok( request('/management')->is_success, 'Request should succeed' );
done_testing();
