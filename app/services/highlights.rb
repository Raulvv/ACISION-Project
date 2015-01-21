module Services
    class Highlights
        def getHighestRankedSessions
            sessions = []
            User.all.each do |user|
                sessions << user.sessions.first
            end
            sessions
        end
    end
end