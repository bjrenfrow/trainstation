# Train station
This is a service that provides endpoints that track and manage
the train schedules for a specific station.

# Install
Install Docker and Docker-Compose: https://docs.docker.com/compose/install/

# Start up the server
1. Open a terminal
1. Run `docker-compose up -d`. This will start up the server in the background
1. logs can be accessed by typing `docker-compose logs -f api`
1. endpoints can be accessed at http://localhost:3000

# Run tests
1. Open a terminal
1. Run `docker-compose run --rm api npm test`.

# API

### POST /schedule/:trainId
You can post a schedule for a new train line that runs through this
station. This post accepts the following information:
- The name of the train line (a string that contains up to four
alphanumeric characters, e.g. ‘EWR0’, ‘ALP5’, ‘TOMO’, etc)
- The list of times when this particular train arrives at this station. These
are specific to the minute the train arrives (i.e. ‘2135)

### GET /:time
A way to get the next time multiple trains are going to be arriving
at this station in the same minute. This request accepts a time value as
an argument, and returns an iso time (rounded to the minute) that reflects the next time two or more trains will arrive at this station simultaneously after the submitted time value.
