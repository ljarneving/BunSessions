## Example
The example is a minimal bank application with four routes: 
* A landing page at route "/", containing a login form.
* A "/login" route to post the login form to.
* A "/account" route, containing the clients bank account.
* A "/logout" route to which the client can post a logout request to.
```typescript
const server = Bun.serve({
    async fetch(req) {

        // Requested path
        const path = new URL(req.url).pathname

        // Response headers
        const headers = {"Content-Type": "text/html; charset=utf-8"}

        // Respond with a form for posting password to /login route.
        if(path === "/") {
            return new Response(`
                <h1>Welcome to Bank</h1>
                <p>
                    Please enter your password to access your account.
                </p>
                <form action = "/login" method = "post">
                    <label for = "password">
                        Password
                    </label><br>
                    <input id = "password" name = "password" type = "password" placeholder = "Enter the password" required/><br>
                    <button type = "submit">Submit</button>
                </form>    
            `, { headers })
        }

        // Recieves post to /login route
        if(path === "/login" && req.method === "POST") {
            const formData = await req.formData()
            if(formData.has("password") && formData.get("password") === "123") {
                return Response.redirect("/account", 302)
            }
        }

        // Want to only make the account accessible if the client is logged in.
        if(path === "/account") {
            return new Response(`
                <h1>Your account</h1>
                <h3>Account balance</h3>
                <p>$0.00</p>
                <button disabled title = "Insufficient funds. Withdrawal cannot be initiated.">Make a withdrawal</button>
                <form action = "/logout" method = "post">
                    <button type = "submit">Logout</button>
                </form>
            `, { headers })
        }

        if(path === "/logout") {
            return Response.redirect("/", 302)
        }

        return new Response("404 Not Found", { status: 404 })
    }
})

console.log(`Server listening to http://localhost:${server.port}`)
```
To restrict access to the account route a cookies and sessions needs to be implemented. Here is how syncSessionsWithRequest is used in our 
minimal working example:
```typescript
import syncSessionsWithRequest from "./sessions/sessions"

const server = Bun.serve({
    async fetch(req) {

        // Creates a new session if no session exists that is associated with the client 
        // or return the existing session to the client.
        const session = syncSessionsWithRequest(req)

        // Requested path
        const path = new URL(req.url).pathname

        // Response headers - A session cookie is added to connect the client with sessions on the server.
        const headers = {"Content-Type": "text/html; charset=utf-8", "Set-Cookie": session.cookie}

        // Respond with a form for posting password to /login route.
        if(path === "/") {
            return new Response(`
                <h1>Welcome to Bank</h1>
                <p>
                    Please enter your password to access your account.
                </p>
                <form action = "/login" method = "post">
                    <label for = "password">
                        Password
                    </label><br>
                    <input id = "password" name = "password" type = "password" placeholder = "Enter the password" required/><br>
                    <button type = "submit">Submit</button>
                </form>    
            `, { headers, status: 200 })
        }

        // Recieves post to /login route
        if(path === "/login" && req.method === "POST") {
            
            const formData = await req.formData()
            
            // Set the session status to login if the credentials are accurate.
            if(formData.has("password") && formData.get("password") === "123") {
                session.isLoggedIn = true
                return Response.redirect("/account", 302)
            }
        }

        // The account is restricted to only logged in sessions.
        if(path === "/account" && session.isLoggedIn) {
            return new Response(`
                <h1>Your account</h1>
                <h3>Account balance</h3>
                <p>$0.00</p>
                <button disabled title = "Insufficient funds. Withdrawal cannot be initiated.">Make a withdrawal</button>
                <form action = "/logout" method = "post">
                    <button type = "submit">Logout</button>
                </form>
            `, { headers, status: 200 })
        }

        // The session logged in status is removed.
        if(path === "/logout") {
            session.isLoggedIn = false
            return Response.redirect("/", 302)
        }

        return new Response("404 Not Found", { headers, status: 404 })
    }
})

console.log(`Server listening to http://localhost:${server.port}`)
```
