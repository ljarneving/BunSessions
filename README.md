## Example
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
``
