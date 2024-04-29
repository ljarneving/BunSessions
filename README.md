# SessionManager
A simple class for session management in .bun applications.

## Quick start
Running `bun init` in your terminal creates the following project structure where index.ts is the entry file (unless otherwise specified during the bun init installation wizard):
```
project-name
├── bun.lockb
├── index.ts
├── node_modules
├── package.json
├── README.md
└── tsconfig.json
```
Adding the following code to the index.ts file - a minimal http server is obtained:
``` javascript 
const server = Bun.serve({

    port: 3000,

    fetch(request) {

        // Path requested by client.
        const path = new URL(request.url).pathname

        // Headers for the responses
        const headers = new Headers()

        if(path === "/") {
            return new Response("Index", { headers, status:200 })
        }
        
        if(path === "/dashboard") { 
            return new Response("Dashboard", { headers, status:200 })
        }
 
        // Response whenever the client request a route that does not exist.
        return new Response("404 Not Found", { headers, status:200 })
    },
  })
  
  console.log(`Listening on ${server.url}`);
```
Assuming the following project structure:
```
project-name
├── bun.lockb
├── index.ts
├── sessions.ts
├── node_modules
├── package.json
├── README.md
└── tsconfig.jsons
```
Creating a session and returning the cookie is fairly simple:
``` javascript 
import syncSessionsWithRequest from "./sessions"

const server = Bun.serve({

    port: 3000,

    fetch(request) {

        // Path requested by client.
        const path = new URL(request.url).pathname

        // Headers for the responses
        const headers = new Headers()

        // Returns the active session of the client or creates a new session if no active session exits.
        const session = syncSessionsWithRequest(request)

        // To send a cookie to the client with the session id - use the cookie property of the session instance.
        Headers.append("Set-Cookie", session.cookie)

        if(path === "/") {
            return new Response("Index", { headers, status:200 })
        }
        
        if(path === "/dashboard") { 
            return new Response("Dashboard", { headers, status:200 })
        }
 
        // Response whenever the client request a route that does not exist.
        return new Response("404 Not Found", { headers, status:200 })
    },
  })
  
  console.log(`Listening on ${server.url}`);
```
In the above example: a new session is created if an active session does not already exists. A session expires after the 
max-age of the session has been reached. The max-age of a session is 3600 seconds by default. To override the default max-age, create 
an .env file and add a SESSION_MAX_AGE entry. For example, to decrease the cookie max-age to 60 seconds create the following .env file:
```
SESSION_MAX_AGE = 60
```
The project structure is now:
```
project-name
├── bun.lockb
├── index.ts
├── sessions.ts
├── .env
├── node_modules
├── package.json
├── README.md
└── tsconfig.json
```
### Restrict routes to authenticated sessions
Each session has a `isLoggedIn` attribute set to false by default. Heres an example how we could restrict access to the dashboard:
``` javascript 
import syncSessionsWithRequest from "./sessions"

const server = Bun.serve({

    port: 3000,

    fetch(request) {

        // Path requested by client.
        const path = new URL(request.url).pathname

        // Headers for the responses
        const headers = new Headers()

        // Returns the active session of the client or creates a new session if no active session exits.
        const session = syncSessionsWithRequest(request)

        // To send a cookie to the client with the session id - use the cookie property of the session instance.
        headers.append("Set-Cookie", session.cookie)

        if(path === "/") {
            return new Response("Index", { headers, status:200 })
        }

        // Minimal example of a route for posting login credentials.
        if(path === "/login" && method === "POST") {
            const data:FormData = await request.formData()
            const username = data.get("username")
            const password = data.get("password")
            // Provided that there is a function authenticateUser that authenticates the username and password.
            const isAuthenticated = authenticateUser(username, password)
            if(isAuthenticated) {
                session.isLoggedIn = true
                return new Response("true", { headers, status:200 })
            }
            return new Response("false", { headers, status:401 })
        }

        // Minimal example of a route for posting a logout request.
        if(path === "/logout" && method === "POST") {
            session.isLoggedIn = false
            return new Response("logged out", { headers, status:204 } )
        }

        // The dashboard route is now restricted but accessible if the client session is authenticated.
        if(path === "/dashboard" && session.isLoggedIn) { 
            return new Response("Dashboard", { headers, status: 200 })
        }
 
        // Response whenever the client request a route that does not exist.
        return new Response("404 Not Found", { headers, status: 404 })
    },
  })
  
  console.log(`Listening on ${server.url}`);
```
