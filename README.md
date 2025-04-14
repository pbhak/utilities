# pbhak's utilities
![Hackatime Badge](https://badge.pbhak.hackclub.app/U07V1ND4H0Q/utilities)

_a small bot I made for my channel (#parneel-yaps, you should join) in the Hack Club Slack_

## Features
- welcoming functionality
  1. send out ephemeral welcome message to user who joined
  2. ask user if they would like to be welcomed publicly
  3. if they choose to be welcomed publicly, send a public welcome message with a 'send message' button
- send message
  - allows user to enter in a message, which will then be sent to me
  - i can then reply, and they can reply back (infinitely)
- reacts with :hyper-dino-wave: when mentioned or :hyper-dino-wave-flip: if mentioned with a wave emoji
- runs an express server which listens on an endpoint and receives data about my phone battery and location every 24 hours, which it then outputs in my channel, #parneel-yaps
- other assorted easter eggs

## Running locally
_not sure why you would do this, but in case you do:_

make sure to make a `.env` file in the root directory with the correct variables set (you can find a list in `.env.template`)
