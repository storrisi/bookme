# Welcome to BookMe

## A straightforward solution to create a 1-to-1 booking link and create Google Calendars events

This project would be something similar to Calendly (and lookalike projects) but with very minimal and basic functionalities.

It just give the ability to connect multiple calendars (with Google Calendar integration) and obtain a unique link to book availabities.

The attendee could even connect his own calendar to see only matchin slots.

## Technologies

### Client Side

- React

### Server Side

- NodeJs
- Firebase

## Configuration

1. Go to https://developers.google.com/identity/sign-in/web/sign-in and sign in for a new client ID
2. Put your new client ID into the file `.env.example` for the value `REACT_APP_CLIENT_ID`
3. Rename the `.env.sample` to `.env`