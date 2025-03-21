<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateUsersTable extends AbstractMigration
{
    public function change(): void
    {
        $this->table('users')
            ->addColumn('email', 'string', ['limit' => 255])
            ->addColumn('name', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('avatar', 'string', ['limit' => 255, 'null' => true])
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('updated_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
            ->addIndex(['email'], ['unique' => true])
            ->create();

        $this->table('verification_codes')
            ->addColumn('email', 'string', ['limit' => 255])
            ->addColumn('code', 'string', ['limit' => 6])
            ->addColumn('expires_at', 'timestamp')
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->create();

        $this->table('user_tokens')
            ->addColumn('user_id', 'integer')
            ->addColumn('token', 'string', ['limit' => 255])
            ->addColumn('expires_at', 'timestamp')
            ->addColumn('created_at', 'timestamp', ['default' => 'CURRENT_TIMESTAMP'])
            ->addForeignKey('user_id', 'users', 'id', ['delete' => 'CASCADE'])
            ->addIndex(['token'], ['unique' => true])
            ->create();
    }
}
