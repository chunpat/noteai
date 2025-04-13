<?php
declare(strict_types=1);

use Phinx\Seed\AbstractSeed;

class CategoriesSeeder extends AbstractSeed
{
    public function run(): void
    {
        $data = [
            // Income categories
            [
                'user_id' => 0,
                'name' => '工资',
                'type' => 'income',
                'icon' => 'money',
                'sort' => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '奖金',
                'type' => 'income',
                'icon' => 'award',
                'sort' => 2,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '投资收益',
                'type' => 'income',
                'icon' => 'trending-up',
                'sort' => 3,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '其他收入',
                'type' => 'income',
                'icon' => 'plus-circle',
                'sort' => 4,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],

            // Expense categories
            [
                'user_id' => 0,
                'name' => '餐饮',
                'type' => 'expense',
                'icon' => 'coffee',
                'sort' => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '购物',
                'type' => 'expense',
                'icon' => 'shopping-bag',
                'sort' => 2,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '交通',
                'type' => 'expense',
                'icon' => 'car',
                'sort' => 3,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '住房',
                'type' => 'expense',
                'icon' => 'home',
                'sort' => 4,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '娱乐',
                'type' => 'expense',
                'icon' => 'film',
                'sort' => 5,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '医疗',
                'type' => 'expense',
                'icon' => 'activity',
                'sort' => 6,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'user_id' => 0,
                'name' => '其他支出',
                'type' => 'expense',
                'icon' => 'more-horizontal',
                'sort' => 7,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ];

        $this->table('categories')->insert($data)->saveData();
    }
}
