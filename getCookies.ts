/**
 * Extracts all cookies from a request and returns an array of { key: value } objects where each key is the key/id 
 * of the cookie and each value is the value of the cookie.
 * @param req Request object
 * @returns An array of { key: value } objects where each key is the key of the cookie and the value 
 * is the value of the cookie. If there are no objects the function returns false.
 */
export default function getCookies(req:Request): { [key: string]: string }[] | false {
    // Cookies are of the form <cookie-id>=<cookie-value>
    // If multiple cookies are sent they are separated by a ;
    // Example <cookie-1>=<cookie-value-1> ; <cookie-2>=<cookie-value-2>
    // This function extracts the cookies as objects in an array: 
    // [{cookie-id:cookie-value}, {cookie-2:cookie-value-2}, ...,{cookie-id-n:cookie-value-n}]
    const cookies = req.headers.get("cookie")?.split(";")
    
    if(!cookies) return false

    return cookies.map(cookie => {
        const cookieSplit = cookie.split("=")
        const cookieId = cookieSplit[0]
        const cookieValue = cookieSplit[1]
        return { [cookieId]:cookieValue }
    })
}
