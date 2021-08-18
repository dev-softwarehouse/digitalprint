<?php


use Phinx\Migration\AbstractMigration;

class FixAddressConstraints extends AbstractMigration
{
    public function change()
    {
        $table = $this->table('dp_categoryLangs');
        $table->addIndex(['slug', 'lang'], [
                    'unique' => true,
                    'name' => 'unique_idx']
            )
            ->save();
    }
}
