# Virgeo - Front-End Developer Technical Challenge

## Objective

Build a simple web application that fetches geospatial data from an API, and displays it on an interactive map. Take security and performance into consideration. This project will test your ability to design, code, and communicate your solution effectively.

## Project setup

This project contains a simple backend server located in the `backend` folder. The code of the backend should not be touched. First install the packages with `npm install`. Then the backend can be run with the following command: `npm run backend`. The backend will run on [localhost:3000](http://localhost:3000).

## Requirements:

1. Login Flow:

- Create a login page where users can enter a username and password.
- Validate credentials against the backend service `POST /login`.
- Display an error message for invalid login attempts.

2. API Integration:

- After a successful login, fetch geospatial data from the backend service `GET /data`.
- Handle errors gracefully (e.g., unauthenticated or invalid responses).

3. Map Display:

- Render the geospatial data on an interactive map using a library like Leaflet.js, Mapbox or MapLibre.
- Include markers to display data points and show the properties of a marker on click.

## Constraints

- Use TypeScript and React. There are no limitations on other libraries and frameworks.
- Make sure your code is testable.
- Provide clear instructions for running the project locally.

## Submission

You can upload the code to a public or private repo in your Github and share the link 2 days in advance. If it's a private repo, please add the people who will be part of the meeting to the repo.

Prepare a short (10-15 minute) presentation where you:

1. Demo your application.
2. Walk us through your code structure and key technical decisions.
3. Share what you're proud of and what could be improved.

This project is designed to give you flexibility to showcase your skills, creativity, and thought process. You can spend as much time as you like on the assignment, but we think you may need around 6-8 hours. We look forward to your presentation!
