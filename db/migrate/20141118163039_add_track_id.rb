class AddTrackId < ActiveRecord::Migration
  def change
    add_column :tracks, :session_id, :integer
  end
end
