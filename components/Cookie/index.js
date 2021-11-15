export default class Cookie {
    static getCookie = (name) => {
        let value = null;
        console.log("getting cookie with name "+name);
        const cookies = document.cookie.split("; ");
        console.log("all cookies");
        console.log(cookies);
        cookies.map((v) => {
            let [key, val] = v.split("=");
            if (key === "subtitleathon_"+name) {
                value = JSON.parse(val);
            }
        })
        console.log("returning ",value);
        return value;
    }

    static setCookie = (name, value) => {
        document.cookie = 'subtitleathon_'+name+'='+ value;
    }

    static deleteCookie = (name) => {
        document.cookie = 'subtitleathon_'+name+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
    }
}