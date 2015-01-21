# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

user = User.create(user_name: 'Fran', nickname:'Franx0')
session = Session.create(session_name: 'Dust In The Wind', description: 'Instrumental', user_id: user.id, from_date: Time.now)


user2 = User.create(user_name: 'Ana', nickname:'Anutxa')
session2 = Session.create(session_name: 'Jam Session' , description: 'Ninguna', user_id: user2.id, from_date: Time.now)

user3 = User.create(user_name: 'Pablo', nickname:'Pablo')
session3 = Session.create(session_name: 'Macarron y guarnicion', description: 'Ninguna', user_id: user3.id, from_date: Time.now)

