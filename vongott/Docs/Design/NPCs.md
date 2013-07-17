NPCs
=======
- All NPCs regardless of affiliation can be killed, with consequences
- Mobile NPCs will implement the A* path finding algorithm

## Mechanical
### Machine Gun Turret
- The turret detects its opponent automatically
- Its affiliation can be changed when hacked

### Patrol Bot
- The patrol bot follows a predetermined route looking for opponents
- Its affiliation can be changed when hacked
- Different types: On wheels and on legs

### Camera
- The camera detects its target automatically
- It can be turned off when hacked or destroyed with a powerful weapon

## Biological
- Biological NPCs will either be stationary or walk a predetermined route
- Especially scripted humans will converse with one another
- Properties:
  - state: Calm, Alert and Aggressive
  - attentionSpan: An amount of seconds for which they will stay alert after losing an enemy
  - hearing: The radius in meters within which an audible sound will be detected
  - vision: The length and radius of their cone of sight in meters

### Allies
- Allied humans will be treated as interactive objects and can be talked to upon interaction
- The merchant class will have a particularly expansive inventory and will invoke the shop screen upon interaction

### Enemies
- Enemies will detect their opponents within a visual and audible range and change state to Aggressive
- Upon losing sight of their target, they will run to the last known position
- If visual cannot be established thereafter, the state is set to Alert
- If visual is not established after attentionSpan expires, state will be set to Calm
- When state is Calm, NPCs return to their route or position
