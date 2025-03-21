<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateAppCredentialsTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('app_credentials', ['id' => false, 'primary_key' => 'appid']);
        $table
            ->addColumn('appid', 'string', ['limit' => 32, 'null' => false])
            ->addColumn('appsecret_hash', 'string', ['limit' => 128, 'null' => false])
            ->addColumn('enterprise_id', 'biginteger', ['null' => false, 'signed' => true])
            ->addColumn('status', 'boolean', ['default' => true, 'null' => false])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'null' => false])
            ->addColumn('expires_at', 'timestamp', ['null' => true])
            ->addIndex(['enterprise_id'])
            ->addIndex(['status'])
            ->create();
    }
}
