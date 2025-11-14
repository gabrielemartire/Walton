class AddOrganization < ActiveRecord::Migration[7.2]
  def change
    create_table :organizations do |t|
      t.string :nome, null: false
      t.string :url
      t.text :descrizione
      t.references :repositories, null: false, foreign_key: true
      t.references :users, null: false, foreign_key: true
      
      t.timestamps
    end
    
    add_index :organizations, :nome
  end
end