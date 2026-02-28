# buewi-tech
Management application for the event technology of the Gymnasium Bürgerwiese Dresden.
# Planned Features
## Definitely
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
# How to run
## Development
1. Pull the source code
2. In the root directory create a folder called `secrets`
3. Create the Ed25519 a private key seed: `head -c 32 /dev/urandom > secrets/ed25519_seed.bin`
4. Install all client dependencies: `cd client && npm install`
5. Run the server
- `cd server`
- `go run ./cmd/main.go`
6. Run the client
- `cd client`
- `npm run dev`
## Build
1. Follow the dev guide including step 3
2. Build the client
- `cd client`
- Install build dependencies: `cd client && npm install --production`
- Build the client: `npm run build`
4. Build the server: `cd server && go build ./cmd/main.go`
5. Clean up unnecessary files
