package Lingit::Model::Schema;
use DBIx::Skinny::Schema;

install_table 'repository' => schema {
    pk 'id';
    columns qw/
        id path create_date
    /;
};

1;
