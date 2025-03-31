<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateCategoriesTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('categories');
        $table->addColumn('user_id', 'integer')
              ->addColumn('name', 'string', ['limit' => 50])
              ->addColumn('type', 'enum', ['values' => ['income', 'expense']])
              ->addColumn('icon', 'string', ['limit' => 50, 'null' => true])
              ->addColumn('sort', 'integer', ['default' => 0])
              ->addColumn('created_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
              ->addIndex(['user_id', 'name', 'type'], ['unique' => true])
              ->addForeignKey('user_id', 'users', 'id', ['delete' => 'CASCADE'])
              ->create();
    }
}
