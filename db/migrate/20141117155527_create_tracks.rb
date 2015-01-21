class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.has_attached_file :audio

      t.timestamps
    end
  end
end
