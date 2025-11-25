# Right Seat

## Get Started

1. Clone the project
2. Make sure to have the appropriate `.env` vile. Required environment variables are:
    - DB_HOST
    - DB_USER
    - DB_DATABASE
    - DB_PASSWORD
    - PW_PEPPER
    - SECRET_ACCESS_TOKEN
    - TOKEN_EXPIRE_DATE
    - PORT
    - NODE_ENV
3. Run `npm install`
4. To initialize the starting data, run `npm run db-init`
5. To run the project, do one of the following:
  - DEV MODE: `npm run dev`
  - PROD MODE: `npm start`


## To login to a test user

The auto-generated passwords are the user's first name and last name, no spaces.

For example, if the user's name is John Doe, their password would be JohnDoe. Please reference the `data/users.json` or `data/students.json` file for pre-populated users.

## Generate jsdocs

To get documentation for all documented functions, run `npm run generate-docs`. This will create files in the **jsdocs** folder. Open index.html in a browser to view the documentation.

## Reset the database

If your database is out of sync and you need to reset it, run the following command: `npm run init-db`.
