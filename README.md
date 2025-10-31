# pbhak's utilities
![Hackatime Badge](https://hackatime-badge.hackclub.com/U07V1ND4H0Q/utilities)

_a small bot I made for my channel (#parneels-pancakeria, you should join) in the Hack Club Slack_

## features!
- Custom interactive welcome logic that allows the user to choose whether they would like to be welcomed publicly
  - If so, they have the option to send me a message through the application, with built in reply functionality
- Quality of life commands
  - /get-id allows for an easy way to get IDs of users, channels, or user groups by mentioning targets in the command (e.g. `/get-id @user #channel`)
  - /sha256 gives quick and easy sha256 hashes of given text (this was especially useful for me, as I needed it for a side project)
  - /yappery joins/leaves my ping group
- Events
  - Responds to being mentioned (response can vary based on what text is accompanied with the mention)
  - Uses the Tailscale API to check the status of my Tailscale nodes every hour based on a cron job, and mentions me with information if a node goes offline
- The application runs in Socket Mode alongside an Express server that:
  - sends a message in my channel every night at 9PM (in whatever my current timezone is) with battery and location information
    - This is powered by an automation in iOS Shortcuts, along with some formatting and reverse geolocation to find the city I'm in
  - sends a message in my channel whenever I complete a walk (powered by the MapMyFitness API), with statistics
- Fully typed, allowing for a smooth developer experience when working on new features

## running locally
_not sure why you would do this, but in case you do:_

make sure to make a `.env` file in the root directory with the correct variables set (you can find a list in `.env.example`)
