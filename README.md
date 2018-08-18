# Multiplayer Rock-Paper-Scissors Game
This game allows two users to play Rock-Paper-Scissors against each other by both visiting the game's URL. It uses Firebase to manage the data, including moves, chats, and presence. 

## How you can help
The game could be made more slick with added animations and other CSS effects. The Firebase data structure could also be improved. Currently, one computer is assigned to the player1 object and other is assigned to player2. Since this had to remain consistent across both environments (e.g. each computer couldn't consider itself player1 for ease), it required quite a bit of logic that depends on state (i.e. if you're the only computer present, you're player1). This is not only convoluted and lends itself to code bloat, but it also exposes the game to unforeseen bugs in the case of abnormal page refreshes, etc. Another approach might be better. 

## Contact
For more information, visit github.com/bry-an.