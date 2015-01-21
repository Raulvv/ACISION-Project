json.array!(@tracks) do |track|
  json.extract! track, :id, :audio
  json.url track_url(track, format: :json)
end
