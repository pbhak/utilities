export async function test_action({ ack, body, client }) { 
  try {
    ack()
    
    await client.chat.update({
      channel: body.channel.id,
      ts: body.message.ts,
      text: 'clicked!'
    });
    
    await client.chat.postEphemeral({
      channel: body.channel.id,
      text: 'hiii!',
      user: 'U07V1ND4H0Q'
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: body.channel.id,
      text: messages.error
    });
    console.error(error);
  }
}

