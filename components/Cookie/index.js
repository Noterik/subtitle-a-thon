export default class Cookie {
    static getCookie = (name) => {
        let value = null;
        const cookies = document.cookie.split("; ");
        cookies.map((v) => {
            let [key, val] = v.split("=");
            if (key === "subtitleathon_"+name) {
                value = JSON.parse(val);
            }
        })
        return value;
    }

    static setCookie = (name, value) => {
        document.cookie = 'subtitleathon_'+name+'='+ value;
    }

    static deleteCookie = (name) => {
        document.cookie = 'subtitleathon_'+name+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
    }
}