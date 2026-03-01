**NOTICE: This project is in active development and does not have a stable release**
# buewi-tech
Management application for the event technology of the Gymnasium Bürgerwiese Dresden.
# Planned Features
## Definitely
- SSR
- Lazy loading for items
- Permissions
- Logging
- Revision of icon system
- Borrowing system
- Admin Panel, including, but not limited to:
    - User management
    - Log/activity insight
    - Management of:
        - (Sub-)Categories
        - Locations
        - Conditions
- "Publicly" accessible contact information
- User profile management
- Basic security fixes
    - Login rate limit
    - Error message obscurity
    - Ones that I notice at some point
## At some point
- Batch actions for items
- Item history
    - Deleted items will be kept in trash for X days
    - Detailed history of edits
    - Possibly implementation of rollbacks
- Accouncement/note board
- English translation (multi language system)
# How to run
The following shows you a basic guide on how to develop on and build the project (on UNIX based systems).
## Development
1. Pull the source code: `git clone https://github.com/maxbrc/buewi-tech.git`
2. Navigate inside and create the secrets folder: `cd buewi-tech && mkdir secrets`
3. Create the Ed25519 a private key seed: `head -c 32 /dev/random > secrets/ed25519_seed.bin`
5. Run the server
- `cd server`
- `go run ./cmd/main.go`
6. Run the client
- `cd client`
- `npm install`
- `npm run dev`
## Build
1. Follow the dev guide including step 3
2. Build the client
- `cd client`
- Install build dependencies: `npm install --production`
- Build the client: `npm run build`
4. Build the server: `cd server && go build ./cmd/main.go`
5. Clean up unnecessary files
