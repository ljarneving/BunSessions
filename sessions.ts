// Sets the maximum age of a session in seconds.
let MAX_AGE = 3600 // default max age.
if(process.env.SESSION_MAX_AGE && typeof process.env.MAX_AGE === "string") {
    MAX_AGE = parseInt(process.env.SESSION_MAX_AGE)
}

/**
 * Sessions is stored in a map (local memory) per default. 
 * Implement a solution of your choise such as storing the sessions 
 * in a database.
 */
const sessions = new Map<string, Session>()

/**
 * Sessions class models a session. A session is created with a unique id, 
 * a login status of false and a corresponding cookie that contains the id 
 * of the session and sets the max age of the cookie.
 * 
 * The session removes itself after expiration.
 */
class Session {
    id:string
    isLoggedIn:boolean
    cookie:string

    constructor() {
        this.id = "" + Bun.hash(`Create session ${sessions.size}`)
        this.isLoggedIn = false 
        this.cookie = `id=${this.id}; Max-Age:${MAX_AGE}; SameSite=Strict`
        
        // Removes the session from sessions when the cookie expires.
        setTimeout(() => {
            this.delete()
        }, MAX_AGE * 1000)
    }

    /**
     * Deletes the session from the sessions.
     */
    delete() {
        sessions.delete(this.id)
    }
}

export default function syncSessionsWithRequest(req:Request):Session {
    // Extracts cookie from the request. 
    const cookie = req.headers.get("cookie") // Returns null if there is no cookie.
    const hasCookie = cookie !== null

    // Extracts id from the cookie
    const id = hasCookie ? cookie.split("=")[1] : ""
    let session = sessions.get(id) // Returns undefined when there is no session with the id.

    if(!session) {
        session = new Session()
        sessions.set(session.id, session)
        return session
    }

    return session
}