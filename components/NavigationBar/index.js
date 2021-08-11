import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import styles from "./navigationbar.module.css"
import classnames from 'classnames';
import Cookie from '../Cookie';
import { useEffect, useState } from 'react';

const environment = process.env.NODE_ENV;
const apiUrl = environment === "development" ? process.env.NEXT_PUBLIC_API_HOST_DEVELOPMENT : process.env.NEXT_PUBLIC_API_HOST;

const headerLinks = [
    {name: 'home', link: '/'}, 
    {name: 'subtitle editor', link: '/subtitle-editor'}, 
    {name: 'events', link: '/events'}, 
    {name: 'login', link: '/login'},
    {name: 'about us', link: '/about-us'}
];

const headerLinksAuthenticated = [
    {name: 'home', link: '/'}, 
    {name: 'subtitle editor', link: '/subtitle-editor'}, 
    {name: 'events', link: '/events'}, 
    {name: 'profile', link: '/profile'},
    {name: 'about us', link: '/about-us'}
]

const NavigationLinks = ({ page, isUserAuthenticated }) => {
    const headerLinksClassname = classnames(styles.navlink);
    const headerLinksCurrentPageClassname = classnames(styles.navlink, styles.selected);

    if (isUserAuthenticated) {
        return(
            <Navbar.Collapse className={`justify-content-end ${styles.navbarCollapse}`}>
            {headerLinksAuthenticated.map((item, key) => 
                <Nav.Link key={key} className={item.name === page ? headerLinksCurrentPageClassname : headerLinksClassname} href={item.link}>{item.name}</Nav.Link>
            )}
            </Navbar.Collapse>
        )
    } else {
        return(
            <Navbar.Collapse className={`justify-content-end ${styles.navbarCollapse}`}>
            {headerLinks.map((item, key) => 
                <Nav.Link key={key} className={item.name === page ? headerLinksCurrentPageClassname : headerLinksClassname} href={item.link}>{item.name}</Nav.Link>
            )}
            </Navbar.Collapse>
        )
    }
};

const NavigationBar = ({ page }) => { 
    const [ isUserAuthenticated, setIsUserAuthenticated ] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const user = Cookie.getCookie("user");

            //Check if we already have the user info stored, otherwise see if we can authenticate
            if (user !== null) {
                setIsUserAuthenticated(true);
            } else {
                fetch(apiUrl+"/user/authenticate",
                {
                    method: "GET",
                    credentials: "include",
                }).then(response => response.json())
                .then(response => {
                    if (!response.error && response.success) {
                        Cookie.setCookie('user', JSON.stringify(response.success));
                        setIsUserAuthenticated(true);
                    }
                });
            }
        }

        fetchData();
    }, [])

    

    return(
        <Navbar collapseOnSelect expand="lg" className={page !== "home" ? styles.navbar : styles.navbarhome}>
            <Navbar.Brand href="/">
                <img
                    src="/subtitleathon-logo-small.png"
                    width="140"
                    className="d-inline-block align-top"
                    alt="Subtitle-a-thon"
                />
            </Navbar.Brand> 
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />        
            <NavigationLinks page={page} isUserAuthenticated={isUserAuthenticated} />          
        </Navbar>
    )
}

export default NavigationBar