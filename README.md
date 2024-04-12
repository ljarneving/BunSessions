# SessionManager
A simple class for session management in .bun applications.

## Introduction
Bun.js is a javascript runtime with direct support for typescript and jsx and strong backward compatability 
with node.js.

A simple http server can be created by running `bun init` in your terminal, which will create 
the following project structure:
```
project-name
├── bun.lockb
├── index.ts
├── node_modules
├── package.json
├── README.md
└── tsconfig.json
```
The entry file for the application is index.ts (unless otherwise specified during the bun init installation wizard). A simple http server is:
``` javascript 
const server = Bun.serve({
    port: 3000,
    fetch(request) {

        // The path within the domain that the client requested.
        const path = new URL(request.url).pathname
        
        // Response when client requests routes that exists.
        if(path === "/") 
            return new Response("Home")
        
        if(path === "/login") 
            return new Response("Login")
        
        // Response that we like to require the client to be authenticated in 
        // order to reach.
        if(path === "/secret") 
            return new Response("Secret") 
        
        // Response whenever the client request a route that does not exist.
        return new Response("404 Not Found")
    },
  });
  
  console.log(`Listening on ${server.url}`);
```
In this example we have three routes: /, /login and /secret. In order to make the /secret route protected/requiring authentication it is important to manage sessions.
1. When a client sends a request to the server, a session is created with a session id. The id is unique to the the client.
2. When the servers sends a response to the client, a cookie with the session id is sent to the client.
3. The session can be logged in or not logged in. Only when the session is logged in should routes that require authentication be accessible by the client.

In the following example, we have added a login.html file. This file contains a form that the 
client can enter username and password into.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example app | login</title>
</head>
<body>
    <form action = "/login" method = "post">
        <h1>Login</h1>
        <label for = "username">
            Username
            <input id = "username" name = "username" placeholder = "Username" required/> 
        </label>
        <label for = "password">
            Password
            <input type = "password"
            id = "password" name = "password" placeholder = "Password" required/>
        </label>
        <button>Login</button>
    </form>
</body>
</html>
```
``` javascript 
const server = Bun.serve({
    port: 3000,
    fetch(request) {

        // The path within the domain that the client requested.
        const path = new URL(request.url).pathname
        
        // Requests that does not require the client to be logged in.
        if(path === "/") 
            return new Response("Home")
        
        if(path === "/login") 
            return new Response("Contact")
        
        // Requests that requires the client to be logged in.
        if(session.isLoggedIn) {
          if(path === "/secret") 
              return new Response("Secret") 
        }
        
        // Response whenever the client request a route that does not exist.
        return new Response("404 Not Found")
    },
  });
  
  console.log(`Listening on ${server.url}`);
```
