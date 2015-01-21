class Session < ActiveRecord::Base
    belongs_to :user
    has_many :tracks

    validates :session_name, presence: true
    validates :description, presence: true
    validates :description, length: {maximum: 300}
    validates :session_name, length: {minimum: 7}
    validates :session_name, length: {maximum: 50}
    validates :user_id, presence: true
end
