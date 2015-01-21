class Track < ActiveRecord::Base
    belongs_to :session
    has_attached_file :audio
    validates_attachment_presence :audio
    validates_attachment_content_type :audio, :content_type => [ 'audio/mp3','audio/mpeg', 'audio/wav']
end
