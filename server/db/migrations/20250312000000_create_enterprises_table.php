<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateEnterprisesTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('enterprises');
        $table
            ->addColumn('name', 'string', ['limit' => 100])
            ->addColumn('code', 'string', ['limit' => 50])
            ->addColumn('status', 'boolean', ['default' => true])
            ->addColumn('config', 'json', ['null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
            ->addIndex(['code'], ['unique' => true])
            ->addIndex(['name'], ['unique' => true])
            ->addIndex(['status'])
            ->create();
    }
}
