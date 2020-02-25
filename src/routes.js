const routes = require('next-routes');

module.exports = routes()  
.add('home', '/', 'index')

.add('discover', '/discover', 'discover')
.add('next-livestreams', '/next-livestreams', 'next-livestreams')

.add('companies', '/companies', 'companies')
.add('company', '/company/:companyId', 'company/[companyId]')

.add('wishlist', '/wishlist', 'wishlist')

.add('terms', '/terms', 'terms')
.add('cookies', '/cookies', 'cookies')
.add('policy', '/policy', 'policy')

.add('upcoming-livestream', 'upcoming-livestream/:livestreamId', 'upcoming-livestream/[livestreamId]')
.add('past-livestream', 'past-livestream/:livestreamId', 'past-livestream/[livestreamId]')
.add('streaming', 'streaming/:livestreamId', 'streaming/[livestreamId]')
.add('player', 'player/:livestreamId', 'player/[livestreamId]')
.add('player-alt', 'player-alt/:livestreamId', 'player-alt/[livestreamId]')

.add('profile', '/profile', 'profile')
.add('signup', '/signup', 'signup');
