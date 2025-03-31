<?php
declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateTransactionsTable extends AbstractMigration
{
    public function change(): void
    {
        $table = $this->table('transactions');
        $table->addColumn('user_id', 'integer')
              ->addColumn('category_id', 'integer')
              ->addColumn('amount', 'decimal', ['precision' => 10, 'scale' => 2])
              ->addColumn('note', 'text', ['null' => true])
              ->addColumn('transaction_date', 'date')
              ->addColumn('created_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP'])
              ->addColumn('updated_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
              ->addForeignKey('category_id', 'categories', 'id', ['delete' => 'RESTRICT', 'update' => 'CASCADE'])
              ->addForeignKey('user_id', 'users', 'id', ['delete' => 'RESTRICT', 'update' => 'CASCADE'])
              ->create();
    }
}
