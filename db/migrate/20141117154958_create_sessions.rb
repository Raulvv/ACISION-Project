class CreateSessions < ActiveRecord::Migration
  def change
    create_table :sessions do |t|
        t.string :session_name
        t.text :description
        t.integer :user_id
        t.datetime :from_date
        t.timestamps
    end
  end
end
